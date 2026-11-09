# AI-Powered Business Complaint Intelligence Platform (BCIP)

> **A multi-tenant, AI-powered complaint management and intelligence
> platform for enterprise businesses.**

BCIP helps businesses centralize customer complaints, understand
complaint content, prioritize operational risk, detect recurring issues,
and support faster, more consistent complaint resolution. Customers can
submit complaints through a dedicated complaint flow, receive a tracking
reference, and follow progress. Authorized business users manage
complaints through role-based dashboards and workflows.

------------------------------------------------------------------------

## Table of Contents

-   [Project Overview](#project-overview)
-   [Problem Statement](#problem-statement)
-   [Objectives](#objectives)
-   [Core Features](#core-features)
-   [AI and Intelligence Components](#ai-and-intelligence-components)
-   [System Architecture](#system-architecture)
-   [Technology Stack](#technology-stack)
-   [User Roles](#user-roles)
-   [Complaint Lifecycle](#complaint-lifecycle)
-   [Repository Structure](#repository-structure)
-   [Prerequisites](#prerequisites)
-   [Local Development Setup](#local-development-setup)
-   [Environment Configuration](#environment-configuration)
-   [API Services](#api-services)
-   [Security Considerations](#security-considerations)
-   [Testing and Evaluation](#testing-and-evaluation)
-   [Current Development Status](#current-development-status)
-   [Limitations and Future
    Enhancements](#limitations-and-future-enhancements)
-   [Contributing](#contributing)
-   [Academic Project Notice](#academic-project-notice)

------------------------------------------------------------------------

## Project Overview

The **AI-Powered Business Complaint Intelligence Platform (BCIP)** is an
enterprise-oriented software solution designed to improve how
organizations receive, analyze, prioritize, assign, and resolve customer
complaints.

Traditional complaint-handling processes often rely on disconnected
channels, manual classification, and inconsistent prioritization. This
can make it difficult for organizations to identify urgent cases,
recognize repeated problems, monitor service quality, and maintain
accountability.

BCIP brings complaint information into a centralized workflow and
applies Natural Language Processing (NLP) and machine-learning
techniques to support complaint classification, sentiment analysis,
urgency assessment, duplicate detection, and operational
decision-making.

The platform is being developed with an initial focus on enterprise SaaS
and technology businesses. Its architecture is intended to support
multiple business tenants, with data and access scoped according to the
authenticated user's organization and role.

## Problem Statement

Businesses may receive complaints through email, websites, social media,
support channels, and other communication methods. When these reports
are handled separately, organizations can face:

-   Fragmented complaint records and limited visibility.
-   Slow manual categorization and assignment.
-   Inconsistent assessment of urgency and business impact.
-   Repeated complaints that are difficult to identify.
-   Delayed escalation of critical customer issues.
-   Limited analytics for identifying recurring operational problems.
-   Weak traceability of actions taken during complaint resolution.

BCIP aims to address these challenges through a centralized complaint
workflow supported by AI-assisted analysis and reporting.

## Objectives

1.  Provide a centralized channel for submitting and managing customer
    complaints.
2.  Support multiple business organizations through a multi-tenant
    architecture.
3.  Analyze complaint text to identify relevant categories and
    sentiment.
4.  Estimate complaint urgency and recommend operational priority.
5.  Identify potentially duplicate or semantically similar complaints.
6.  Help authorized staff assign, respond to, and escalate complaints.
7.  Maintain complaint status history and an auditable operational
    workflow.
8.  Present complaint trends and workload information through
    dashboards.
9.  Support customer communication and complaint tracking.

## Core Features

### Customer complaint submission

-   Dedicated complaint submission flow for a business.
-   Complaint details and relevant category information.
-   Optional evidence or attachment upload, where enabled.
-   Tracking reference for following complaint progress.
-   Status visibility through the customer complaint experience.

### Business complaint management

-   Centralized complaint queue.
-   Complaint details, status, category, sentiment, and priority.
-   Assignment to relevant staff members.
-   Complaint response and resolution workflow.
-   Escalation of complaints requiring additional attention.
-   Complaint history and audit-oriented activity tracking.

### AI-assisted complaint intelligence

-   NLP-based complaint classification.
-   Sentiment analysis.
-   Urgency and priority assessment with an explanation or supporting
    signals.
-   Semantic similarity checks to identify potential duplicates.
-   AI-assisted summaries and response suggestions, where configured.

### Dashboards and reporting

-   Complaint volume and status overview.
-   Priority and category distribution.
-   Operational workload visibility.
-   Complaint trends to support business analysis.

> Feature availability depends on the currently implemented application
> modules and configuration. AI-generated classifications and
> suggestions should be reviewed by authorized staff rather than treated
> as infallible decisions.

## AI and Intelligence Components

BCIP combines task-specific NLP models and decision-support logic.

  -----------------------------------------------------------------------
  Component               Technology / approach   Purpose
  ----------------------- ----------------------- -----------------------
  Text classification     DistilBERT-based model  Predict complaint
                                                  category from complaint
                                                  text

  Semantic similarity     `all-MiniLM-L6-v2` with Identify potentially
                          sentence embeddings     similar or duplicate
                                                  complaints

  Urgency assessment      CURS (Complaint Urgency Support urgency ranking
                          Ranking System) and     and operational
                          Smart Priority logic    prioritization

  Language processing     NLP preprocessing and   Prepare complaint text
                          model inference         for analysis

  Generative AI           Configurable LLM        Support summaries and
  assistance              integration             response drafting
  -----------------------------------------------------------------------

### AI processing flow

1.  The customer submits complaint text and any permitted supporting
    evidence.
2.  The backend validates and stores the complaint.
3.  The AI service receives the complaint text for analysis.
4.  The classification model predicts a complaint category.
5.  Sentiment and urgency components produce additional signals.
6.  Semantic similarity is used to identify possible duplicate
    complaints.
7.  The backend stores or applies the analysis according to the
    configured workflow.
8.  Business staff review the complaint and take the appropriate action.

**Important:** Model performance figures should only be published after
they have been reproduced and documented using the project's evaluation
dataset and methodology. Do not interpret a model prediction as a
guaranteed outcome.

## System Architecture

BCIP is organized into three primary application layers:

-   **Frontend:** Web interface for customer complaint submission and
    business operations.
-   **Backend API:** Authentication, authorization, tenant-aware
    business logic, persistence, complaint workflows, and integrations.
-   **AI service:** Dedicated API for NLP inference and semantic
    analysis.

A simplified logical flow:

``` text
Customer / Business User
          |
          v
     Next.js Frontend
          |
          v
   Express Backend API
      |       |       |
      |       |       +---- Email / external AI integrations
      |       |
      |       +------------ PostgreSQL (Prisma ORM)
      |
      +-------------------- FastAPI AI Service
                                |
                                +-- DistilBERT classification
                                +-- Sentence Transformers
                                +-- Urgency / priority analysis
```

Redis is included in the development infrastructure for supporting
services that require caching, queues, or other transient data
operations.

## Technology Stack

  -----------------------------------------------------------------------
  Layer                               Technologies
  ----------------------------------- -----------------------------------
  Frontend                            Next.js 16, React 19, TypeScript,
                                      Tailwind CSS 4

  Backend                             Node.js, Express 5, TypeScript

  Validation                          Zod

  Database                            PostgreSQL

  ORM                                 Prisma

  AI / ML API                         Python, FastAPI, Pydantic

  NLP / ML                            Transformers, Sentence Transformers

  Semantic model                      `all-MiniLM-L6-v2`

  Classification model                DistilBERT-based model

  Infrastructure                      Docker, Docker Compose

  Supporting service                  Redis

  Authentication and security         JWT, bcrypt, Helmet, CORS, rate
                                      limiting

  Logging                             Pino

  Email                               Resend integration

  File handling                       Multer

  External AI integration             Configurable provider integration,
                                      including Azure AI Foundry /
                                      OpenAI-compatible API configuration
  -----------------------------------------------------------------------

Versions and integrations may differ between branches and deployment
environments. Confirm the installed package versions and environment
configuration in the repository before deployment.

## User Roles

The application is designed around role-based access control. The
currently defined role names include:

  -----------------------------------------------------------------------
  Role                                Intended responsibility
  ----------------------------------- -----------------------------------
  `SUPER_ADMIN`                       Platform-level administration

  `BUSINESS_ADMIN`                    Manage a business tenant and its
                                      users/settings

  `MANAGER`                           Monitor operations and manage
                                      complaint assignments

  `AGENT`                             Handle assigned complaints and
                                      customer responses

  `ESCALATION_AGENT`                  Handle complaints escalated for
                                      additional review
  -----------------------------------------------------------------------

Access to each resource must be enforced by the backend. Hiding a
frontend page or control is not a substitute for server-side
authorization.

## Complaint Lifecycle

A typical complaint workflow is:

``` text
Submitted
   |
   v
Validated and Stored
   |
   v
AI-Assisted Analysis
   |
   v
Prioritized / Added to Queue
   |
   v
Assigned to Staff
   |
   v
Under Review
   |
   +------> Escalated (if required)
   |
   v
Response / Resolution
   |
   v
Closed
```

The exact status names and allowed transitions are determined by the
application's complaint-status implementation. The diagram represents
the intended workflow, not a definitive list of database enum values.

## Repository Structure

The project is organized into separate frontend, backend, and AI-service
applications. A representative layout is:

``` text
BCIP/
├── bcip-frontend/       # Next.js web application
├── bcip-backend/        # Express + TypeScript API
├── bcip-ai-service/     # FastAPI NLP / ML service
├── docker-compose.yml   # Local supporting services (if present)
└── README.md
```

Your actual repository may use a different AI-service folder name or
additional packages. Keep this section aligned with the checked-out
repository.

## Prerequisites

Install the tools required by the services you intend to run:

-   Node.js (use the version specified by the repository's `engines`
    field or version manager configuration).
-   npm, or the package manager specified by the relevant lockfile.
-   Python 3.10+ (confirm the AI service's supported version).
-   PostgreSQL, or Docker with Docker Compose.
-   Redis, or Docker if the project uses the supplied Redis service.
-   Git.

## Local Development Setup

The following is a general development sequence. Exact script names,
ports, and environment variable names must be confirmed from each
service's `package.json`, configuration files, and environment examples.

### 1. Clone the repository

``` bash
git clone <YOUR_REPOSITORY_URL>
cd <YOUR_REPOSITORY_DIRECTORY>
```

### 2. Configure infrastructure

If the repository includes a Docker Compose configuration for PostgreSQL
and Redis, review it and start the required services:

``` bash
docker compose up -d
```

If you are not using Docker, create the PostgreSQL database and Redis
instance manually, then configure their connection values in the
relevant service environment files.

### 3. Configure and start the backend

``` bash
cd bcip-backend
npm install
```

Create the backend environment file using the variable names documented
by the backend configuration or `.env.example`. Configure the database
connection and other required services.

Run database migrations using the script defined in the backend
`package.json`. For example, if the repository defines a Prisma
migration script:

``` bash
npx prisma migrate dev
```

Start the backend using the development script defined by the
repository. A common convention is:

``` bash
npm run dev
```

### 4. Configure and start the AI service

Open a separate terminal:

``` bash
cd bcip-ai-service
python -m venv .venv
```

Activate the virtual environment:

**Windows PowerShell**

``` powershell
.venv\Scripts\Activate.ps1
```

**macOS / Linux**

``` bash
source .venv/bin/activate
```

Install dependencies using the dependency file provided by the AI
service. For a `requirements.txt`-based project:

``` bash
pip install -r requirements.txt
```

Configure any required model paths, model settings, and service
variables. Start the FastAPI application using the entry point and
command specified in the repository. A common convention is:

``` bash
uvicorn main:app --reload
```

The module path may differ; use the actual FastAPI entry point in the
project.

### 5. Configure and start the frontend

Open another terminal:

``` bash
cd bcip-frontend
npm install
```

Create the frontend environment file using the variable names expected
by the frontend configuration. Set the backend API base URL to the
address where the backend is running.

Start the frontend using the script defined in its `package.json`. A
common convention is:

``` bash
npm run dev
```

### 6. Verify the services

-   Open the frontend using its configured local development URL.
-   Check the backend health endpoint, if one is implemented.
-   Check the FastAPI documentation endpoint if Swagger UI is enabled.
-   Submit a test complaint and verify persistence, AI analysis, and
    status handling.
-   Verify that users cannot access another tenant's records or perform
    actions outside their role.

Do not assume default ports or endpoint paths: use the values configured
in the checked-out code.

## Environment Configuration

Environment files should be created locally and must not be committed
with real credentials. The following table lists configuration
categories that the application may require; it is not a claim that
every variable exists under these exact names.

  -----------------------------------------------------------------------
  Configuration category              Typical purpose
  ----------------------------------- -----------------------------------
  Database URL                        PostgreSQL connection

  Redis URL                           Redis connection

  JWT secret / token settings         Authentication token signing and
                                      expiry

  Frontend origin / CORS              Restrict permitted browser origins

  Backend API URL                     Frontend-to-backend communication

  AI service URL                      Backend-to-FastAPI communication

  Email provider key                  Transactional email delivery

  LLM provider endpoint and key       Optional generative AI integration

  File storage configuration          Complaint evidence and attachment
                                      storage
  -----------------------------------------------------------------------

Use the exact variable names from the source code and `.env.example`
files. Never put API keys, passwords, JWT secrets, private certificates,
or production credentials in this README or in version control.

## API Services

BCIP exposes application functionality through its backend API and AI
inference service.

### Backend API responsibilities

-   Authentication and user management.
-   Tenant and role-aware authorization.
-   Complaint creation, retrieval, updates, and assignment.
-   Complaint status and escalation workflows.
-   Evidence upload handling.
-   Communication and external service integrations.
-   Dashboard and reporting data.

### AI service responsibilities

-   Complaint text analysis.
-   Category prediction.
-   Sentiment and urgency-related analysis.
-   Semantic embedding and similarity operations.

For the exact endpoint list, request/response schemas, authentication
requirements, and example payloads, consult the backend route
definitions and the AI service API documentation in the repository.

## Security Considerations

Security is essential because complaint records may contain customer
information and business-sensitive evidence.

-   Enforce authentication and authorization on the server.
-   Scope every tenant-owned database operation to the authenticated
    tenant.
-   Validate and sanitize incoming request data.
-   Restrict CORS to trusted frontend origins.
-   Apply rate limits to sensitive and public-facing endpoints.
-   Hash passwords using an appropriate password-hashing algorithm.
-   Store secrets in environment variables or a managed secrets service.
-   Validate uploaded file type, size, and content; do not trust the
    filename or client-provided MIME type alone.
-   Protect customer tracking flows against unauthorized access and
    enumeration.
-   Avoid logging passwords, tokens, private complaint content, or other
    sensitive data.
-   Use HTTPS in deployed environments.
-   Review AI-generated content before sending it to customers.
-   Maintain audit records for important administrative and complaint
    actions.

## Testing and Evaluation

Testing should cover both functional behavior and AI model quality.

### Application testing

-   Authentication and role-based access.
-   Tenant isolation and authorization boundaries.
-   Complaint submission and validation.
-   Complaint assignment, status changes, and escalation.
-   File upload restrictions.
-   Email and notification behavior.
-   API error handling and rate limiting.
-   Frontend form validation and user experience.

### AI evaluation

Evaluate each AI component independently using a documented,
representative dataset.

  -----------------------------------------------------------------------
  Evaluation area                     Suggested measures
  ----------------------------------- -----------------------------------
  Complaint classification            Accuracy, precision, recall, macro
                                      F1-score, confusion matrix

  Sentiment analysis                  Per-class precision, recall,
                                      F1-score

  Urgency ranking                     Ranking quality, class-wise
                                      metrics, review of false negatives

  Duplicate detection                 Precision, recall, F1-score at a
                                      documented similarity threshold

  Generative AI assistance            Human review for factuality,
                                      relevance, safety, and usefulness
  -----------------------------------------------------------------------

Document dataset composition, preprocessing, train/validation/test
separation, class distribution, model configuration, thresholds, and
evaluation date. Avoid reporting a single accuracy figure without its
evaluation context.

## Current Development Status

BCIP is an academic Final Year Project under active development. Its
intended scope includes multi-tenant complaint management, AI-assisted
complaint analysis, operational prioritization, duplicate detection, and
business-facing dashboards.

Implementation status can change as modules are completed and
integrated. Before presenting this README as a release document, update
it with:

-   Confirmed repository structure and setup commands.
-   Verified environment variable names and service ports.
-   Implemented API endpoint documentation.
-   Completed test results and AI evaluation metrics.
-   Screenshots of the current application, if appropriate.
-   Deployment instructions and known limitations.

## Limitations and Future Enhancements

Potential future improvements include:

-   More robust multilingual support for English, Urdu, and Roman Urdu.
-   Expanded model evaluation and monitoring across business domains.
-   Improved explainability for urgency and priority recommendations.
-   More integrations with enterprise support channels.
-   Advanced analytics and configurable business reports.
-   Production-grade object storage and attachment scanning.
-   Background processing for computationally expensive AI tasks.
-   Stronger observability, audit reporting, and operational monitoring.
-   Accessibility and usability improvements based on user testing.

These items should be treated as future enhancements unless they are
already implemented in the current codebase.

## Contributing

For academic team development:

1.  Coordinate changes with the project team.
2.  Use feature branches for isolated work.
3.  Keep environment files and secrets out of commits.
4.  Validate changes locally before opening a pull request.
5.  Include relevant tests for new functionality.
6.  Update documentation when routes, configuration, or workflows
    change.

Suggested commit style:

``` text
feat: add complaint assignment workflow
fix: enforce tenant scope in complaint queries
docs: update local setup instructions
test: cover complaint status transitions
```

## Academic Project Notice

BCIP is being developed as a university Final Year Project. The project
documentation describes its intended architecture and functionality;
actual capabilities should be verified against the current source code
and tested deployment. AI outputs are decision-support signals and
should be reviewed by responsible business users.

------------------------------------------------------------------------

**Project:** AI-Powered Business Complaint Intelligence Platform (BCIP)\
**Domain:** Enterprise Complaint Management, NLP, and AI-assisted
Business Intelligence\
**Project Type:** Final Year Project (FYP)
