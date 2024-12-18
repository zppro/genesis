import { internalMutation, query, QueryCtx } from "./_generated/server";
import { defineTable } from "convex/server";
import { UserJSON } from "@clerk/backend";
import { v, Validator } from "convex/values";

export const table = 'users'
export const indexName_ByExternalId = 'byExternalId';
export const IdUser = v.id(table)

export const userSerialized = {
  name: v.string(),
  email: v.string(),
  image_url: v.optional(v.string()),
  // this the Clerk ID, stored in the subject JWT field
  externalId: v.string(),
}

export const tableSchema = defineTable(userSerialized).index(indexName_ByExternalId, ["externalId"])

async function userByExternalId(ctx: QueryCtx, externalId: string) {
  return await ctx.db
    .query(table)
    .withIndex(indexName_ByExternalId, (q) => q.eq("externalId", externalId))
    .unique();
}

export const upsertFromClerk = internalMutation({
  args: { data: v.any() as Validator<UserJSON> }, // no runtime validation, trust Clerk
  async handler(ctx, { data }) {
    const email = data.email_addresses.find(em => em.id === data.primary_email_address_id)!.email_address
    let name = (data.first_name ?? "") + (data.last_name ?? "")
    name = name ? name : email.split('@')[0]
    const userAttributes = {
      name: name,
      email: email,
      image_url: data.has_image ? data.image_url : undefined,
      externalId: data.id,
    };

    const user = await userByExternalId(ctx, data.id);
    if (user === null) {
      await ctx.db.insert(table, userAttributes);
    } else {
      await ctx.db.patch(user._id, userAttributes);
    }
  },
});

export const deleteFromClerk = internalMutation({
  args: { clerkUserId: v.string() },
  async handler(ctx, { clerkUserId }) {
    const user = await userByExternalId(ctx, clerkUserId);

    if (user !== null) {
      await ctx.db.delete(user._id);
    } else {
      console.warn(
        `Can't delete user, there is none for Clerk user ID: ${clerkUserId}`,
      );
    }
  },
});

export async function getCurrentUserOrThrow(ctx: QueryCtx) {
  const userRecord = await getCurrentUser(ctx);
  if (!userRecord) throw new Error("Can't get current user");
  return userRecord;
}

export async function getCurrentUser(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) {
    return null;
  }
  return await userByExternalId(ctx, identity.subject);
}

export const current = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});