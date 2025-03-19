import { z } from "zod";

// Helper function to generate UUID using Web Crypto API
export function generateUUID() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  array[6] = (array[6] & 0x0f) | 0x40; // Version 4
  array[8] = (array[8] & 0x3f) | 0x80; // Variant 1

  const hex = Array.from(array, (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


// Create a zod schema from a JSON Schema object
export function createZodSchema(schema: any): z.ZodTypeAny {
  const type = schema.type;

  if (type === 'string') {
    return z.string();
  } else if (type === 'number') {
    return z.number();
  } else if (type === 'integer') {
    return z.number().int();
  } else if (type === 'boolean') {
    return z.boolean();
  } else if (type === 'array') {
    const items = schema.items || {};
    return z.array(createZodSchema(items));
  } else if (type === 'object') {
    const properties = schema.properties || {};
    const shape: Record<string, z.ZodTypeAny> = {};

    for (const [key, value] of Object.entries(properties)) {
      shape[key] = createZodSchema(value as any);
    }

    let baseSchema = z.object(shape);

    // Handle required properties
    if (schema.required && Array.isArray(schema.required)) {
      const requiredShape: Record<string, z.ZodTypeAny> = {};

      for (const key of Object.keys(shape)) {
        const isRequired = schema.required.includes(key);
        requiredShape[key] = isRequired ? shape[key] : shape[key].optional();
      }

      baseSchema = z.object(requiredShape);
    }

    return baseSchema;
  } else {
    return z.any();
  }
}
