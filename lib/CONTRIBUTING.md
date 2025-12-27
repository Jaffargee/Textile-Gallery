# Contributing to Tahir Gallery

First of all, thank you for considering contributing to **Tahir Gallery** 🙏
This project is an **open-source textile gallery application** built with **Expo + Supabase Storage**, and contributions of all kinds are welcome.

This document explains **how to contribute**, **coding standards**, and **project expectations** so everyone works efficiently and consistently.

---

## 🧠 Project Philosophy

Tahir Gallery follows a **clean, scalable, and production-oriented architecture**. The goal is to keep the app:

* Easy to reason about
* Safe for offline-first usage
* Modular and extensible
* Free from unnecessary overengineering

We prioritize **clarity over cleverness**.

---

## 🏗️ Architecture Overview

The project uses:

* **Repository Pattern** – database logic is isolated
* **Unit of Work** – grouped transactional operations
* **Singletons** – shared services (DB, Cache)
* **Batch Processing** – controlled async workloads
* **In-memory caching** – performance optimization

Supabase **Storage** is the source of truth for textile images.

---

## 📁 Project Structure (Simplified)

```
lib/
 ├── batch/           # Batch processors
 ├── cache/           # In-memory cache
 ├── database/        # SQLite / local DB logic
 ├── uow/             # Unit of Work
 ├── logger/          # Logging utilities
 └── cache-db.ts      # DB + Cache orchestration
```

---

## 🧩 Coding Style & Guidelines

### Language

* **TypeScript** (strict typing encouraged)
* Avoid `any` unless absolutely necessary

### Style Rules

* Use **classes** for stateful services
* Prefer **explicit method names**
* Keep methods short and single-purpose
* Avoid side effects inside getters

### Naming Conventions

* `PascalCase` → Classes
* `camelCase` → Methods & variables
* `UPPER_SNAKE_CASE` → Constants

### Async Code

* Always use `async/await`
* Never mix `.then()` chains
* Handle errors explicitly

---

## 🗃️ Database & Cache Rules

* DB access must go through **repositories**
* Transactions must use:

  * `runTransaction()` or
  * `runUnitOfWork()`
* Cache invalidation must be explicit

Never access the database directly from UI components.

---

## 🖼️ Images & Albums

* Images are **textile fabrics only**
* Albums map directly to Supabase Storage folders
* No videos or non-image files
* Folder naming should use **kebab-case**

Example:

```
gallery/super-wax/
gallery/ankara/
gallery/lace/
```

---

## 🧪 Testing

Currently, the project relies on:

* Manual testing via Expo Dev Client
* Logging for debugging

Automated tests are welcome as contributions.

---

## 🐛 Reporting Bugs

When reporting bugs, please include:

* Device & OS
* Expo version
* Steps to reproduce
* Expected vs actual behavior
* Relevant logs

Open an issue with clear details.

---

## ✨ Feature Requests

Feature ideas are welcome, especially:

* Performance improvements
* Offline UX enhancements
* Album browsing enhancements
* Image optimization

Please open an issue before starting major work.

---

## 🔀 Pull Request Process

1. Fork the repository
2. Create a feature branch

   ```bash
   git checkout -b feature/my-feature
   ```
3. Make your changes
4. Ensure the app runs with `expo start --dev-client`
5. Commit with clear messages
6. Open a Pull Request

Small, focused PRs are preferred.

---

## 📜 Code of Conduct

* Be respectful
* Be constructive
* No harassment or discrimination

This is a learning-friendly, professional project.

---

## 🙌 Thank You

Your contribution helps make **Tahir Gallery** better for everyone.

Happy coding! 🚀
