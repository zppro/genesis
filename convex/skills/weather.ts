import { ConvexError } from "convex/values";
import { z } from "zod"
import { createFunctionHandler } from "openai-zod-functions";

export const functions = [
  createFunctionHandler({
    name: "weatherForecastBySeniverse",
    description: "获取指定地区天气情况",
    schema: z.object({
      days: z.number(),
      location: z.string(),
      start: z.number()
    }),

    /**
     * This handler gets called with parsed/validated arguments typed by your schema.
     *
     * You can perform any (async) computation, and return any value you want.
     * Or just return args unchanged if you want to use tool output directly.
     */
    handler: async (args) => {
      const apiKey = process.env[`SENIVERSE_KEY`]
      if (!apiKey) {
        throw new ConvexError(`skill function (weatherForecastBySeniverse) api key is not found!`);
      }
      const url = `https://api.seniverse.com/v3/weather/now.json?key=${apiKey}&location=${args.location}&language=zh-Hans&unit=c&start=${args.start}&days=${args.days}`
      // const res = await fetch(`https://api.seniverse.com/v3/weather/now.jsonn?${params}`);
      const res = await fetch(url);
      const data = await res.json()


      // const seniverseV3 = new SeniverseV3({
      //   encryption: {
      //     uid: '', // 公钥
      //     key: '', // 私钥
      //     ttl: 10000, // 签名失效时间
      //     enabled: false // 是否进行签名验证
      //   },
      //   query: {
      //     unit: 'c', // 单位
      //     language: '', // 结果返回语言
      //     timeouts: [3000, 3000] // 重试次数和超时时间
      //   },
      //   // 内存缓存
      //   cache: {
      //     ttl: 100, // 缓存时间，单位为秒，可以为 'auto'
      //     max: 1000, // 缓存数据条数
      //     enabled: true // 是否开启缓存
      //   },
      //   returnRaw: false // 是否直接返回 API 原始数据
      // })

      // const data = await seniverseV3.weather.daily.data(args);
      // console.log("weatherForecastBySeniverse handle return data:", data)
      return {
        data
      }
    }
  })
]