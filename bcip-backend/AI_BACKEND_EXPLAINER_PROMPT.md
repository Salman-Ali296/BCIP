# Backend ko samajhne ke liye AI prompt

Neeche diya gaya prompt kisi bhi AI model ko dein. Behtar results ke liye poora repository ya kam-se-kam `bcip-backend/` folder us model ko accessible hona chahiye.

```text
Tum is repository ke senior backend engineer aur patient programming teacher ho.
Mujhe is project's backend ko samajhna hai. Repository ko khud inspect karke
simple, accurate Hindi/Hinglish mein samjhao. Main beginner ho sakta hoon:
technical terms ka pehli baar aane par seedha matlab bhi batao.

SCOPE
- Main backend folder: bcip-backend/
- Zaroorat padne par integration samajhne ke liye bcip-frontend/ aur
  bcip-ai-services/ ko sirf read karo.
- Code ko modify, delete, rename, format, ya generate mat karo. Yeh explanation
  aur codebase walkthrough hai; implementation task nahi.
- Secrets, tokens, private keys, passwords, ya .env ki values ko kabhi print ya
  quote mat karo. Sirf variable names aur unka purpose bata sakte ho.

ANALYSIS RULES
1. Pehle repository tree, package.json, tsconfig, src/server.ts, src/app.ts,
   routes, middleware, services/modules, Prisma schema+migrations, aur tests
   inspect karo. Har conclusion ko actual file/code se verify karo.
2. Filename dekhkar functionality assume mat karo. Agar file khaali, placeholder,
   duplicate, legacy, ya route se unconnected ho to clearly batao.
3. Har major explanation mein file path do; relevant ho to function/class ka naam
   aur line number bhi do. Line numbers current files se verify karo.
4. Jo confirm nahi ho sakta usse "verify nahi hua" bolo; guess ko fact mat banao.
5. Backend code ko frontend ya Python AI service ka code samajhkar explain mat karo.
   In services ke beech actual HTTP/API integration ho to request aur response
   direction ke saath samjhao.
6. Har endpoint ke liye HTTP method, mounted URL, authentication/role requirements,
   input ka source, main processing, aur response/error behavior identify karo.
   URLs ko app.ts aur router mounting se derive karo; router file ke local path ko
   final URL mat samjho.
7. Multi-tenant authorization, validation, rate limit, idempotency, correlation ID,
   file upload, error middleware, aur webhook raw-body handling ko dhyan se trace
   karo. Security guarantees sirf tab claim karo jab code se supported hon.
8. Code quality par alag se report do: typecheck/build/test ke actual results,
   known gaps, incomplete modules, mismatches aur operational risks. Tests pass
   hone ko production-ready hone ka proof mat bolo.
9. Agar repository dirty ya files uncommitted hon to unhe change mat karo; current
   code ko read-only analyze karo.

REPORT IS ORDER MEIN DO

## 1. Ek minute ka overview
Backend kya karta hai, kis language/runtime/framework/database par chalta hai,
aur frontend, PostgreSQL, Redis, Stripe, Firebase, email aur AI service ke saath
iska kya relation hai. Sirf verified integrations likho.

## 2. Language aur run lifecycle
Saaf batao ki code JavaScript hai, TypeScript hai, ya dono ka mix. `.ts` files
run/build kaise hoti hain, server kahan se start hota hai, app kahan configure
hota hai, database connection kab hota hai, shutdown kaise hota hai, aur
development/build/test commands kya hain.

## 3. Folder-by-folder map
`src/`, `prisma/`, aur `test/` ke har important folder/file ka role table mein
do: Path | Responsibility | Iska caller/next layer | Implementation status.
Pure tree ko bina matlab file-by-file repeat na karo, lekin backend ke important
modules ko chhodo bhi mat.

## 4. Request ka end-to-end raasta
Ek incoming HTTP request ko entry point se response tak arrows/numbered steps mein
trace karo. Global middleware ka actual order aur har middleware ka kaam batao.
Phir ek real example, jaise complaint submit ya login, ko router -> middleware ->
controller -> service/use case -> repository/database/AI -> response tak trace
karo. Har step par file path cite karo.

## 5. API route guide
Routes ko groups mein list karo: health/root, auth/account, complaints, admin,
analytics, notifications, billing, trial aur doosre versioned endpoints.
Har group ke actual mounted URLs, public/protected status, roles/tenant checks,
important request body/path/query fields, result aur rate limits do. Code mein
route present hai par handler placeholder/empty ho to usse working endpoint na
kehna.

## 6. Complaint lifecycle
Customer complaint ka creation, validation, tenant/customer association, attachment
handling, AI analysis, priority/category/sentiment/duplicate behavior, agent
assignment, tracking ID, email, status update/escalation/feedback aur persistence
step-by-step samjhao. AI unavailable hone par kya hota hai, retry/circuit breaker
ya fallback waqai wired hai ya nahi—code se prove karo. Agar do complaint
implementations/flows milen to dono compare karo aur batao kaunse routes un tak
jaate hain; unhe ek hi flow maan kar merge mat karo.

## 7. Authentication, authorization aur tenant isolation
Registration/login/session/Firebase/email verification/password reset ka flow;
JWT ya cookie ka use; role checks; tenant ID kis source se aata hai; business
trial/verification gates; admin access. Authenticated user aur tenant ke beech
ka data access kaise restrict hota hai, actual code references ke saath samjhao.
Public tracking/complaint endpoints ko protected endpoints se alag rakho.

## 8. Database aur data model
Prisma models aur important relations ko plain language mein samjhao (Tenant,
User, Customer, Complaint aur baaki relevant models). Migrations ka purpose aur
schema update ka normal workflow batao. Seed file kya banati hai, use bhi verify
karo. Schema mein field/model hona is baat ka proof nahi ki feature fully wired
hai.

## 9. External services aur configuration
Har actual external call ka purpose aur path batao. Required/optional environment
variable names ko group karo—database, server/security, Firebase, Stripe, email,
AI, Redis/CORS—magar values kabhi mat dikhana. Missing configuration par startup
ya endpoint ka behavior batao. `.env` ki exact location ko source se verify karo.

## 10. Error handling, validation aur security controls
Validation library/schemas, sanitization, upload limits/type checks, auth,
authorization, CORS, rate limits, request IDs/logging, idempotency, HTTP error
responses, webhook verification, secret handling ka status samjhao. Har control
ke liye file/code evidence do. Control sirf dependency mein installed ho to
usse implemented mat batao.

## 11. Tests aur code ki sehat
Package scripts se exact commands nikaalo. Relevant automated tests kya cover karte
hain aur kya cover nahi karte, batao. Agar tools available hon to backend folder
se typecheck, tests aur build run karke exact pass/fail/count report karo; tests
ko modify mat karo. Command run na ho sake to reason batao, result invent mat karo.
Potential bugs/mismatches ko severity aur evidence ke saath alag list karo; verified
bug, likely issue, aur suggestion ko clearly distinguish karo.

## 12. Gaps aur next steps
Implemented, partially implemented, placeholder/unwired, aur uncertain features ki
alag lists do. Pehle correctness/production blockers, phir cleanup suggestions.
Har item ke liye file evidence aur user impact batao; bina evidence ke defect declare
mat karo.

## 13. Glossary aur viva-friendly summary
API, middleware, controller, service/use case, repository, ORM, Prisma migration,
JWT, tenant isolation, webhook, circuit breaker jaise terms ko chhote examples ke
saath samjhao. Aakhir mein 10–15 lines ki aisi summary do jise main presentation
ya viva mein apne alfaaz mein bata sakoon.

OUTPUT STYLE
- Hindi/Hinglish, headings, concise tables, numbered flows, aur simple analogies.
- Har important factual claim ke saath repository-relative path; code references
  ke liye line numbers tabhi do jab tumne verify kiye hon.
- Pehle "kya hai", phir "kaise kaam karta hai", phir "kya incomplete/risky hai".
- Data flow, API behavior, aur code health ko alag rakho.
- Final answer mein yeh bhi likho ki tumne kaunse commands actually chalaye aur
  unka result kya tha.
```
