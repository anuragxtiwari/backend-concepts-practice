--Rate Limiter--

Sliding Window Log Rate Limiter

Intermediate

Language: JavaScript · Runtime: Node.js · Modules: ES Modules

1. Problem statement

Ek reusable RateLimiter class implement karo jo control kare ki koi individual user ek specified time window mein maximum kitni API requests kar sakta hai.

Har user ke requests independently track honge. Limit exceed hone par incoming request reject hogi. Jaise hi purani requests time window se bahar nikalti hain, user ke liye capacity available ho jayegi.

Is implementation mein Sliding Window Log algorithm use karna hai.

2. Functional requirements

Constructor limit aur windowMs accept kare.

Dono parameters positive integers hone chahiye. Invalid values par error throw karo.

Har user ke request timestamps Map mein maintain karo.

allowRequest(userId) method implement karo.

Har request par current time ke hisaab se expired timestamps remove karo.

Agar current window mein requests ki count limit se kam hai, toh request allow karo aur uska timestamp store karo.

Agar limit already reach ho chuki hai, toh request reject karo.

Rejected requests ke liye retryAfterMs return karo — yaani request dobara kab try ki ja sakti hai.

Different users ki limits independent honi chahiye.

Request history ko unnecessarily accumulate nahi hone dena hai.