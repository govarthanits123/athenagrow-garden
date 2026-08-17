# AthenaGrow Garden

Do not explain platform limitations.

Do not compare technologies.

Do not simplify, remove, or replace any of the requirements below.

I understand that this project uses the existing Lovable stack:

TanStack Start + React + TypeScript + Tailwind CSS + Supabase.

You are working on the EXISTING AthenaGrow project.

Your task is to COMPLETE and REPAIR the existing AthenaGrow application in a single implementation.

IMPORTANT:

- Do not create a separate new project.

- Do not redesign the existing AthenaGrow visual language.

- Do not replace working functionality unnecessarily.

- Inspect the existing project first.

- Reuse existing components, routes, styling, database structure, utilities, and logic wherever possible.

- Fix broken functionality instead of creating fake/demo versions.

- Every button and interaction described below must actually work.

- Do not leave placeholder buttons.

- Do not leave static/demo Garden data.

- Do not create fake roadmaps that are disconnected from the user's subjects.

- Do not stop after creating UI.

- Complete the frontend, data layer, backend integration, and required database changes.

- Verify the complete application after implementation.

==========================================================

ATHENAGROW PRODUCT

==========================================================

AthenaGrow is an AI-powered personalized learning platform where learning is represented as a living garden.

Students create learning subjects from their syllabus and learning materials.

Each subject becomes a living plant/tree.

As the student learns:

- topics are completed

- mastery increases

- XP increases

- the plant grows

- achievements are unlocked

- progress appears throughout the application

The application must feel like a living learning environment, NOT like a traditional education/admin dashboard.

==========================================================

IMPORTANT EXISTING PROBLEMS TO FIX

==========================================================

The current AthenaGrow project has these problems.

1. Athena AI does not properly answer questions.

2. PDF upload does not work reliably.

3. Users cannot reliably create a new subject.

4. The "Grow My Garden" button does not reliably complete the learning-path creation process.

5. Uploaded/pasted learning material is not reliably converted into a usable subject.

6. Existing subjects do not reliably appear in the Garden.

7. Existing subjects do not open their learning journey.

8. Existing subjects do not show their roadmap.

9. Continue Learning does not reliably open the correct unfinished topic.

10. Discover dashboard does not work reliably.

11. Some existing Garden content is static/demo content.

12. Learning progress is not consistently persisted.

13. The application must have a simple Sign In experience, but it must remain lightweight.

FIX THESE PROBLEMS AS PART OF THIS IMPLEMENTATION.

==========================================================

1. SIMPLE SIGN-IN

==========================================================

Create a minimal Sign In screen.

Do not build a complicated account-management experience.

Screen:

AthenaGrow logo

"Welcome back to your learning garden."

Name or email input

Password input

Sign In button

Optional:

"Continue with Google"

The Sign In interaction must work correctly with the application's existing data model.

After signing in, the user enters AthenaGrow.

Also support a simple local/prototype profile so that the application can work during development without requiring a complicated setup.

A stable profile ID must be created and reused for the same user/device.

All learning data must belong to that profile.

Do not create anonymous/demo subjects that appear for every user.

==========================================================

2. USER NAME SETUP

==========================================================

After first sign-in, if the user has not configured their name:

Display:

"What should Athena call you?"

Input:

Full name / preferred name

Continue button

Large friendly Athena illustration.

Save the name to the user's profile.

After completion continue to Learning Category.

==========================================================

3. LEARNING CATEGORY

==========================================================

Create an interactive category selection screen.

Cards:

School Student

College Student

Competitive Exams

Working Professional

Lifelong Learner

Each card:

- has its own illustration/icon

- has a clear title

- has a short description

- animates slightly when selected

Save the selected category to the user's profile.

==========================================================

4. UPLOAD LEARNING MATERIAL

==========================================================

This flow is extremely important and MUST work.

Screen title:

"Build Your Learning Journey"

Required:

Upload Syllabus

Supported:

- PDF

- TXT

- pasted text

Optional:

Upload Notes

Supported:

- multiple PDF files

- TXT files

- pasted text

- camera scan if already supported by the project/device

Description:

"Uploading notes allows Athena to generate explanations using your own learning material."

Buttons:

Upload Syllabus

Upload Notes

Skip Notes

Continue

The system must actually read the uploaded files.

PDF files MUST be parsed correctly.

TXT files MUST be parsed correctly.

Pasted text MUST be accepted.

Multiple note files must be handled.

Validate unsupported file types.

Display useful error messages when parsing fails.

Do NOT merely store the filename.

The actual text/content must be extracted and used to generate the learning path.

==========================================================

5. GROW MY GARDEN

==========================================================

The button:

"GROW MY GARDEN"

MUST ACTUALLY WORK.

When the user clicks it:

1. Validate the syllabus/material.

2. Extract the text.

3. Identify the subject or subjects.

4. Create the subject record.

5. Create units/topics for the subject.

6. Generate the learning roadmap.

7. Save the roadmap.

8. Save uploaded material metadata/content as appropriate.

9. Associate everything with the current profile.

10. Navigate to the AI Processing screen.

11. After processing, navigate to the Garden.

12. The newly created subject MUST immediately appear in the Garden.

There must be no dead button.

If AI generation fails:

- do NOT lose the subject.

- create a sensible content-derived fallback roadmap.

- save it.

- continue to the Garden.

The learning path must therefore work even if AI generation is temporarily unavailable.

==========================================================

6. AI PROCESSING SCREEN

==========================================================

Create a beautiful AI processing experience.

Show Athena AI avatar.

Do NOT use a boring traditional loading screen.

Use animated:

- leaves

- vines

- growing branches

- particles

- garden elements

Messages change dynamically:

"Analyzing your syllabus..."

"Extracting subjects..."

"Understanding your learning material..."

"Organizing topics..."

"Building your personalized roadmap..."

"Growing your learning garden..."

The screen must correspond to the actual processing state.

Do not remain stuck indefinitely.

If a backend operation fails, show a recoverable error and allow the user to retry.

==========================================================

7. HOME DASHBOARD

==========================================================

The Home Dashboard is the most important screen in AthenaGrow.

It must NOT look like a normal educational dashboard.

It must immediately communicate that learning is represented as a living garden.

----------------------------------------------------------

HERO SECTION

----------------------------------------------------------

Top approximately 35% of the screen:

"My Learning Garden"

The tree/garden must be the primary visual focus.

The background dynamically changes based on time of day.

MORNING:

- sunrise

- birds

- flowers opening

AFTERNOON:

- bright sky

- butterflies

- leaves swaying

EVENING:

- golden sunset

- warm orange lighting

NIGHT:

- moonlight

- stars

- fireflies

- softly glowing plants

The Garden must be responsive.

Tree appearance reacts to mastery.

HIGH MASTERY:

- large tree

- many leaves

- flowers

- butterflies

- birds

- golden glow

LOW MASTERY:

- smaller tree

- fewer leaves

- little/no flowers

- subdued appearance

The tree must use actual subject/progress data.

Do not hard-code one static tree.

----------------------------------------------------------

AI RECOMMENDATION

----------------------------------------------------------

Example:

"Athena recommends"

"Study DBMS today."

"Reason:

Unit 3 hasn't been revised in 5 days."

Button:

"Start Learning"

The recommendation should use available learning progress where possible.

Clicking Start Learning must open the appropriate unfinished/recommended topic.

----------------------------------------------------------

TODAY'S GOALS

----------------------------------------------------------

Create a student-created checklist.

Display:

Today's Goals

Add Goal

Allow users to:

- add goals

- check goals

- uncheck goals

- remove goals if appropriate

Persist goals.

----------------------------------------------------------

PROGRESS CARDS

----------------------------------------------------------

Elegant cards:

Weekly Study Hours

Mastery Score

Quiz Accuracy

XP Earned

Do NOT use graphs.

Use clean visual cards and progress indicators.

Values must come from actual user data.

----------------------------------------------------------

RECENT ACHIEVEMENTS

----------------------------------------------------------

Display recently unlocked badges.

Button:

"View All"

Achievements must be data-driven.

----------------------------------------------------------

FLOATING ATHENA BUTTON

----------------------------------------------------------

Initially display only a floating circular Athena AI button.

When tapped:

expand into an AI chat panel.

Quick actions:

Explain

Summarize

Generate Quiz

Flashcards

Voice Mode

Ask Athena

The panel must actually function.

==========================================================

8. ATHENA AI

==========================================================

Athena AI MUST WORK.

This is a core feature.

Athena must answer user questions about:

- uploaded syllabus

- uploaded notes

- current subject

- current topic

- general educational questions

Example:

User:

"What is normalization in DBMS?"

Athena:

Provides a useful explanation.

User:

"Explain this topic in simple terms."

Athena:

Provides an understandable explanation.

User:

"Give me a quiz about this."

Athena:

Generates quiz questions.

User:

"Summarize my uploaded notes."

Athena:

Uses the user's uploaded material.

Athena must use the current context when available:

- current subject

- current topic

- uploaded material

- roadmap

- learning progress

IMPORTANT:

Do not create an interface that pretends AI works while returning meaningless static responses.

Use the existing AI/server integration where available.

If the AI service fails:

- show a clear error

- provide a useful fallback for basic educational explanations where possible

- do not freeze the UI

- allow retry

AI requests must not expose secret API keys to the browser or Android bundle.

Add proper loading states.

Add timeout/error handling.

==========================================================

9. LEARNING GARDEN

==========================================================

Create the complete Learning Garden.

Every subject has its own tree/plant.

Example subjects:

DBMS

Operating Systems

Java

Artificial Intelligence

Mathematics

IMPORTANT:

These are examples only.

The actual Garden must display the user's real subjects.

If the user creates:

"Computer Networks"

then Computer Networks must appear as a plant/tree.

If the user adds:

"Data Structures"

then Data Structures must appear.

Do not hard-code the Garden.

Remove/avoid static demo subjects.

Each subject should display:

- name

- mastery

- growth stage

- progress

- current/next topic

- visual plant/tree

Clicking a subject MUST open its Subject Learning Roadmap.

"Continue Learning" MUST open the first unfinished topic.

==========================================================

10. SUBJECT CREATION

==========================================================

Users must be able to add subjects from the Garden.

Add:

"+ Add Subject"

The user can:

- enter subject name

- upload syllabus

- paste syllabus text

- upload notes

- skip notes

Then:

"Grow My Garden"

The subject must be created.

A roadmap must be generated.

The subject must appear in the Garden.

The data must persist after:

- refreshing the page

- restarting the app

- reopening Android app

==========================================================

11. SUBJECT LEARNING ROADMAP

==========================================================

This is one of the most important missing features.

When the user taps a subject tree:

Open:

"Master DBMS"

The roadmap must be a vertical learning journey.

It must NOT look like a normal chapter list.

Example:

🌱 Start

↓

● Introduction ✔

↓

📚 Topic Summary ✔

↓

❓ Quiz Challenge

↓

● ER Model ✔

↓

📝 Practice Assignment

↓

● SQL

↓

🎤 Viva Practice

↓

● Normalization

↓

📑 Revision Session

↓

● Transactions

↓

🎯 Final Assessment

↓

🌳 Master Subject

The exact topics must come from the generated subject roadmap.

Do not hard-code DBMS topics for every subject.

For another subject, generate appropriate topics.

For example:

Operating Systems

could contain:

Introduction

Processes

Threads

CPU Scheduling

Synchronization

Deadlocks

Memory Management

File Systems

Revision

Final Assessment

The roadmap should visually communicate progress.

Completed nodes:

- checkmark

- glowing/healthy appearance

- connected completed path

Current node:

- highlighted

- animated

- "Continue Learning"

Locked future nodes:

- visually muted

The subject tree should visually grow as progress increases.

==========================================================

12. TOPIC WORKSPACE

==========================================================

When a roadmap topic is selected, open a Topic Workspace.

Display:

Topic Name

Mastery

Estimated Time

Difficulty

Action Cards:

Learn

Notes

Explain with Athena

Voice Learning

Summary

Flashcards

Quiz

Important Questions

Button:

"Mark Complete"

When completed:

- save completion

- increase mastery

- award XP

- update subject growth

- unlock next roadmap node

- update Garden

- update Dashboard

- update Progress

If uploaded notes exist:

Show the user's notes first.

Include:

AI Highlights

Key Concepts

Explain with Athena

If notes are unavailable:

Generate an AI lesson.

==========================================================

13. QUIZ

==========================================================

Create a premium quiz experience.

Quiz must use the current topic/subject.

Support:

- multiple-choice questions

- answer selection

- next question

- progress indicator

- submit

After submission:

Calculate result.

==========================================================

14. QUIZ RESULT

==========================================================

Do NOT show only a percentage.

Create an engaging result screen.

Display:

Score

Correct Answers

Incorrect Answers

XP Earned

Mastery Increase

Achievement if unlocked

Animate the subject tree growing.

Examples:

new leaves

flowers

branches

glow

Buttons:

Continue Learning

Review Answers

Back to Garden

Persist the result.

==========================================================

15. PROGRESS

==========================================================

Create the Progress screen.

Display:

Weekly Study Hours

Mastery

XP

Achievements

Completed Topics

Quiz Accuracy

Do NOT use graphs.

Use elegant cards and progress indicators.

All values must come from actual stored data.

==========================================================

16. PROFILE

==========================================================

Profile screen:

Name

Learning Category

Achievements

Settings

Allow the user to edit:

- name

- learning category

Include application settings appropriate for AthenaGrow.

==========================================================

17. DISCOVER

==========================================================

Create a functional Discover dashboard.

Discover should allow users to explore learning content/subjects.

Examples:

Trending Subjects

Recommended Learning

Popular Topics

Explore Subjects

Clicking a Discover item must work.

It should open the appropriate subject/topic/learning experience.

Do not leave Discover as a static visual page.

If remote Discover data is unavailable, show a useful local catalog rather than an infinite loading state.

==========================================================

18. NAVIGATION

==========================================================

Main navigation:

Home

Garden

Athena

Progress

Profile

Discover should be accessible from the appropriate location in the application.

Navigation must work on:

- desktop

- mobile

- Android

No dead links.

No broken routes.

==========================================================

19. DATA STORAGE / BACKEND

==========================================================

Use the existing Supabase setup for persistent application data.

The following must be persisted:

Profile

Name

Learning Category

Subjects

Subject mastery

Units

Topics

Topic completion

Current topic

Roadmap

Uploaded learning material metadata

Extracted text where appropriate

Goals

Quiz results

XP

Achievements

Discover items where appropriate

Study progress

Every user's learning data must be associated with their profile.

Do not use hard-coded in-memory data as the primary data source.

Do not lose data on refresh.

Do not lose data when the Android application restarts.

Implement proper loading, empty, and error states.

==========================================================

20. PDF PROCESSING

==========================================================

PDF upload MUST work.

Use a reliable client-compatible PDF extraction approach.

The system must:

1. Select PDF.

2. Read PDF.

3. Extract text.

4. Validate extracted content.

5. Show upload success.

6. Use extracted text to create the learning path.

If PDF contains multiple pages, process all pages.

Show:

"PDF processed successfully"

when extraction succeeds.

If extraction fails:

"Unable to read this PDF. Please try another PDF or paste the syllabus text."

Do not silently fail.

==========================================================

21. PASTED TEXT

==========================================================

Users must be able to paste syllabus content.

Example:

DBMS

Unit 1 Introduction

Unit 2 ER Model

Unit 3 SQL

Unit 4 Normalization

Unit 5 Transactions

The system should parse this into useful learning topics.

The "Grow My Garden" button must work with pasted text even if no PDF is uploaded.

==========================================================

22. FALLBACK LEARNING PATH

==========================================================

AI generation is preferred.

However, the application must never fail completely if AI generation is unavailable.

Create a deterministic fallback roadmap from the uploaded/pasted content.

Example:

Input:

Unit 1 Introduction

Unit 2 SQL

Unit 3 Normalization

Output:

Introduction

Quiz Challenge

SQL

Practice Assignment

Normalization

Revision

Final Assessment

Save this roadmap.

The user must still be able to study.

==========================================================

23. ERROR HANDLING

==========================================================

Every important async operation must have:

Loading state

Success state

Error state

Retry option

Especially:

PDF upload

Subject creation

Roadmap generation

Garden loading

Discover loading

Athena AI

Quiz generation

Progress updates

Never allow an infinite spinner.

Never leave a button apparently doing nothing.

==========================================================

24. ANDROID / CAPACITOR

==========================================================

The existing project is already configured for Android using Capacitor.

Do not break the existing Android configuration.

The application must continue to work as a static Capacitor application.

The Android build must use:

dist/client

as the Capacitor web directory.

Ensure the application works correctly inside the Android WebView.

Avoid depending on server-only functionality for core learning features that must work inside the packaged Android application.

Client-side Supabase operations should be used where appropriate.

Server-side AI functionality must remain secure.

==========================================================

25. DESIGN REQUIREMENTS

==========================================================

Maintain the existing AthenaGrow design language.

Do NOT redesign existing screens unnecessarily.

The application should feel:

- magical

- organic

- calm

- modern

- premium

- educational

- friendly

Use:

- garden-inspired visuals

- rounded cards

- subtle shadows

- smooth transitions

- organic shapes

- plant/tree growth animations

- soft gradients

- beautiful typography

- responsive layouts

Avoid:

- generic admin dashboard appearance

- excessive tables

- boring cards everywhere

- overly corporate styling

- static placeholder illustrations

- fake progress

- fake subjects

==========================================================

26. REAL DATA FLOW

==========================================================

The complete flow MUST work like this:

SIGN IN

↓

USER NAME SETUP

↓

LEARNING CATEGORY

↓

UPLOAD/Paste SYLLABUS

↓

OPTIONAL NOTES

↓

GROW MY GARDEN

↓

AI PROCESSING

↓

SUBJECT CREATED

↓

ROADMAP CREATED

↓

GARDEN

↓

SUBJECT TREE

↓

SUBJECT ROADMAP

↓

TOPIC

↓

LEARN / NOTES / ATHENA / QUIZ

↓

MARK COMPLETE

↓

XP + MASTERY

↓

TREE GROWS

↓

NEXT TOPIC UNLOCKED

↓

SUBJECT MASTERED

This must be a real working data flow.

==========================================================

27. DO NOT USE STATIC DEMO DATA

==========================================================

This is extremely important.

Do not make the Garden appear to work using fake hard-coded subjects.

Do not make the roadmap appear to work using a hard-coded DBMS roadmap.

Do not make Progress appear to work using fake numbers.

Do not make achievements appear using fake progress.

Do not make Discover appear functional while links do nothing.

All of these must be connected to actual application data.

Demo/fallback data may only be used when there is genuinely no user data, and it must never be presented as the user's actual learning data.

==========================================================

28. EXISTING PROJECT PRESERVATION

==========================================================

Before making changes:

Inspect:

- existing routes

- existing components

- existing Supabase client

- existing database integration

- existing AI integration

- existing Garden components

- existing Dashboard

- existing Athena components

- existing upload components

- existing styling

- existing Capacitor configuration

Then repair and extend the existing implementation.

Do not create duplicate routes for the same feature.

Do not create duplicate data layers unless necessary.

Do not remove existing working functionality.

==========================================================

29. VERIFICATION

==========================================================

After implementation, verify the application.

Run:

npm run build

Then:

npm run build:capacitor

Then:

npx cap sync android

Then:

cd android

gradlew assembleDebug

Fix all build errors.

Also test these complete flows:

TEST 1:

Sign in

→ setup name

→ choose category

→ paste syllabus

→ Grow My Garden

→ Garden

→ new subject appears

TEST 2:

Sign in

→ upload PDF syllabus

→ PDF extracted

→ Grow My Garden

→ subject created

→ roadmap generated

TEST 3:

Garden

→ tap subject

→ roadmap opens

→ tap current topic

→ topic workspace opens

→ mark complete

→ progress updates

→ next topic unlocks

TEST 4:

Topic

→ Ask Athena

→ Athena answers

TEST 5:

Topic

→ Generate Quiz

→ answer quiz

→ result

→ XP awarded

→ mastery updated

→ tree grows

TEST 6:

Garden

→ Continue Learning

→ correct unfinished topic opens

TEST 7:

Refresh/restart application

→ subjects remain

→ progress remains

→ roadmap remains

TEST 8:

Discover

→ open Discover

→ content appears

→ select item

→ correct learning screen opens

==========================================================

30. FINAL REQUIREMENT

==========================================================

Do NOT stop after implementing only the UI.

The goal is a COMPLETE WORKING AthenaGrow application.

Every major screen must exist.

Every major button must work.

Every learning flow must work.

Subjects must be dynamically created.

PDF upload must work.

Pasted syllabus must work.

Roadmaps must be dynamically generated.

Garden must use real subjects.

Topic completion must update progress.

Athena AI must answer questions.

Quiz must work.

XP and mastery must update.

Tree growth must reflect progress.

Discover must work.

Data must persist.

Android build must work.

If you encounter an error during implementation, debug it and fix it before continuing.

Do not simply report the error.

Do not stop because one service is unavailable.

Use safe fallbacks where appropriate while preserving the intended functionality.

Do not replace the requirements with a simplified prototype.

Complete the application end-to-end.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/0ee49036-1d5e-4c9f-a1cb-66fc59541bce).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
