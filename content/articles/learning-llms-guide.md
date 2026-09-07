---
readTime: 6
title: "A practical guide to learning LLMs: from foundations to agents"
date: "2026-02-09"
description: "A staged learning roadmap for engineers, with practical projects, completion checkpoints, and evaluation built into every step."
categories: ["AI", "Career", "Learning"]
---

If you're an engineering student who wants to understand large language models beyond using a chatbot, it helps to have a path. There is a lot to learn, and a long list of courses can make it harder to decide what to do next.

This is the roadmap I would use: understand the foundations, implement a small model, learn to measure its behavior, and then build applications with retrieval and tools. Each stage ends with something you can demonstrate.

## Choose your starting point

**New to programming or machine learning?** Start at stage 1. You can experiment with an LLM while learning Python; you don't need to master every mathematical prerequisite before making your first small application.

**Already comfortable with Python and neural networks?** Try the stage 1 checkpoint, then move to stage 2. You should be able to work with arrays, read a training loop, and explain the difference between training and validation data.

This is a learning sequence, not a fixed timetable. Give yourself time to debug. Finishing a course and being able to explain your own implementation are different milestones.

## 1. Build the foundations

Start with Python functions, data structures, files, packages, and debugging. Then learn enough linear algebra to understand vectors and matrix multiplication, and enough calculus and probability to follow gradients and predictions.

Resources to work through:

- [AI Python for Beginners from DeepLearning.AI](https://www.deeplearning.ai/courses/ai-python-for-beginners) for an introduction to Python with practical exercises.
- [3Blue1Brown's linear algebra lessons](https://www.3blue1brown.com/?topic=linear-algebra) for visual explanations of vectors and transformations.
- [Practical Deep Learning for Coders from fast.ai](https://course.fast.ai/) for training models and connecting the theory to code.

**Completion checkpoint:** Write a script that loads a small dataset, separates training and validation examples, and trains a simple model. Explain what the loss measures and why a good training score may fail to generalize.

## 2. Understand transformers

Work through tokenization, embeddings, attention, and next-token prediction. Trace how text becomes token IDs, how those IDs move through a model, and how the output distribution becomes generated text.

The [Hugging Face LLM Course](https://huggingface.co/learn/llm-course/chapter1/1) is a useful hands-on starting point. For a deeper academic treatment, follow the lectures and assignments in [Stanford CS224N: Natural Language Processing with Deep Learning](https://web.stanford.edu/class/cs224n/).

**Completion checkpoint:** Tokenize a short passage and run a small pretrained model. Draw the path from input tokens to output probabilities. Explain why changing the prompt or sampling settings can change the result.

## 3. Implement a small model

This is where the concepts become concrete. Build a small transformer and train it on a modest text dataset that you have permission to use. Keep the model small enough that you can inspect tensors and rerun experiments without an expensive setup.

Follow [Andrej Karpathy's GPT implementation walkthrough](https://www.youtube.com/watch?v=kCc8FmEb1nY), and use [minGPT](https://github.com/karpathy/minGPT) as an educational reference. The repository is in a semi-archived state, so treat it as code to study rather than a production dependency.

**Completion checkpoint:** Train a small model, save and reload a checkpoint, and generate samples. Plot training and validation loss. Change one parameter, such as context length, and describe what changed and what stayed uncertain.

Fine-tuning can come next. Choose a model that fits your hardware and licensing requirements, then compare it with the untuned model on held-out examples. Fine-tuning is an experiment with a measurable goal; it is not an automatic improvement.

## 4. Evaluate before adding complexity

A convincing answer can still be wrong. Decide what success means for your task before choosing a metric.

For a document question-answering tool, useful checks include whether the answer is supported by the source, whether its citations are correct, and whether it admits when the information is missing. For a summarizer, you might also check coverage, factual consistency, and length.

Create a small evaluation set with ordinary requests, ambiguous requests, and cases where the system should decline to guess. Keep some examples separate from the ones you use while tuning. Review actual outputs alongside aggregate scores.

**Completion checkpoint:** Compare a baseline with one changed prompt or model on the same examples. Record successes, failures, latency, and cost. Explain at least one case where a single score hides an important failure.

## 5. Add retrieval when the task needs it

Retrieval-augmented generation, or RAG, supplies relevant material to the model before it answers. It is useful when answers depend on a document collection or information that changes. It also introduces another possible failure: retrieving the wrong material.

Start with a small, familiar collection. Preserve source identifiers while splitting documents into chunks. Inspect retrieved passages before judging the final answer.

Work through [Building and Evaluating Advanced RAG Applications from DeepLearning.AI](https://learn.deeplearning.ai/courses/building-evaluating-advanced-rag/) for a guided exercise. As your project grows, compare chunk sizes, keyword and embedding search, and re-ranking against your evaluation set.

**Completion checkpoint:** Build a document QA tool that links answers to source passages and handles unanswerable questions. Test it after changing or removing a document. Separate retrieval failures from answer-generation failures in your notes.

## 6. Build a bounded agent

An agent can choose tools and take several steps toward a task. Start with one narrow job and a small set of tools, such as looking up a document and doing a calculation.

[Lilian Weng's overview of LLM-powered agents](https://lilianweng.github.io/posts/2023-06-23-agent/) explains planning, memory, and tool use. [Anthropic's guide to building effective agents](https://www.anthropic.com/engineering/building-effective-agents) is useful for deciding when a fixed workflow is sufficient and when flexible tool use helps.

Make tool inputs explicit. Limit the number of steps, handle tool errors, and require confirmation before a learning project changes external data. Record which tools were called so you can investigate failures.

**Completion checkpoint:** Demonstrate a successful task, an unavailable tool, and a request outside the agent's scope. Compare the agent with a simpler fixed workflow. Keep the added complexity only if the results justify it.

## Turn the exercises into one project

A small document assistant can connect the later stages:

1. Choose a collection you understand and write realistic questions about it.
2. Establish a baseline using a simple prompt and a few documents.
3. Add retrieval, preserving sources and checking answer quality.
4. Add one tool only when it solves a clear limitation.
5. Publish a short project note with the approach, evaluation examples, failure cases, and next improvement.

The result should make your engineering decisions visible. A demo shows that a system can work once; an evaluation helps show where it works and where it does not.

## Keep the setup manageable

You can use a local environment or a hosted notebook. Choose small models and datasets first. Hosted compute and model APIs may incur charges, and access limits change, so check the provider's current terms and set a budget before running experiments.

Keep a record of package versions, model versions, prompts, and data splits. Reproducibility makes it much easier to understand whether a change helped.

## Keep building, and keep questioning

You don't have to finish every resource here. Pick one at each stage, build the exercise, and use the checkpoint to find the gaps in your understanding.

The aim is to become more deliberate: to explain how a system works, recognize its limits, and measure whether a change improved it. Production work adds further requirements around reliability, privacy, security, and operations. Treat this roadmap as a foundation for that work, with plenty of room to go deeper.
