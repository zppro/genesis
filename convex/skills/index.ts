import { functions as topicFunctions } from "./topic";
import { functions as weatherFunctions } from "./weather";

export const skillFunctions = [...topicFunctions, ...weatherFunctions]