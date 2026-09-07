---
readTime: 2
title: "Vibe coding and the rise of the product engineer"
date: "2026-02-09"
description: "When implementation gets easier, choosing the right problem and measuring the result become even more valuable."
categories: ["AI", "Career"]
---

AI can make it quicker to get from an idea to a working prototype. That makes another part of the work more visible: deciding what is worth building.

The engineer I find most interesting in that environment understands the user problem, makes product tradeoffs, and stays involved after the code ships. That's how I think about a product engineer.

They own a loop: user problem → proposed solution → implementation → measurement. AI can help with the implementation. The judgment still has to come from someone who understands the problem and can assess the result.

## What that looks like in practice

Consider a hypothetical support dashboard. A request arrives to add an export button. It is easy to jump straight into building a CSV download.

A product engineer first asks what the export is for. If the user needs to send the same weekly summary to a colleague, a saved report might be more useful. If they need to analyze data in a spreadsheet, the export may be exactly right.

The next step is a small, testable version. Decide which fields belong in the report, check access permissions, and watch someone use it. After shipping, measure whether the task became easier: fewer manual steps, fewer errors, or less time spent preparing the report.

The code is part of the answer. Understanding the workflow tells you which code to write.

## Technical depth still matters

I don't think product sense replaces technical expertise. Reliable systems need people who understand architecture, security, performance, and the consequences of a shortcut. AI-generated changes need that scrutiny too.

What I want to emphasize is the connection between those skills and the outcome. An engineer who can explain a technical tradeoff in terms of the user's task helps a team make better decisions.

For small teams especially, there is value in people who can move between a user conversation, a prototype, and a production issue. That doesn't mean every team should shrink or every engineer should have the same role. It means ownership can extend beyond completing a specification.

Build the thing, understand why it matters, and come back to see whether it helped.

---

*Inspired by [The rise of one-pizza engineering teams](https://www.jampa.dev/p/the-rise-of-one-pizza-engineering).*
