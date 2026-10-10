import { RateLimiter} from "./RateLImiterV2.mjs"

const rateLimitor = new RateLimiter(3,5000);

console.log(rateLimitor.allowRequest("user101"))
console.log(rateLimitor.allowRequest("user102"))
console.log(rateLimitor.allowRequest("user101"))
console.log(rateLimitor.allowRequest("user102"))
console.log(rateLimitor.allowRequest("user102"))
console.log(rateLimitor.allowRequest("user101"))
console.log(rateLimitor.allowRequest("user102"))
console.log(rateLimitor.allowRequest("user101"))
console.log(rateLimitor.allowRequest("user102"))
console.log(rateLimitor.allowRequest("user102"))