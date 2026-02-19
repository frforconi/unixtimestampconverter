# 🕐 Unix Timestamp Converter

*Your complete POSIX time conversion suite*

## 🌍 Web site

:sparkles::tada:

Live Site available at [unixtimestampconverterepoch.com](https://unixtimestampconverterepoch.com/)

:fireworks::confetti_ball:

---

## What is Unix Timestamp Converter?

🧰 **Unix Timestamp Converter** is a free online tool designed for developers, system administrators, and IT professionals who need to convert, track, and manage Unix timestamps quickly and accurately.

The site offers **four main tools** integrated into a modern, responsive interface that works on any device.

---

## 📦 Available Tools

### 1️⃣ Date Converter

The bidirectional converter transforms Unix timestamps into human-readable dates and vice versa.

**How to use:**

1. Enter a Unix timestamp (integer of seconds since January 1, 1970) in the input field
2. Click "Convert" to get the corresponding date
3. Or, enter a date in ISO 8601 format to get the timestamp

**Features:**
- ✅ Bidirectional conversion
- ✅ Timezone support (GMT/UTC and local time)
- ✅ ISO format and natural language input
- ✅ Real-time (automatically calculates current timestamp)

---

### 2️⃣ World Clock

A global clock showing the current time in major cities across all continents.

**How to use:**

1. View the real-time current time for each listed city
2. The clock synchronizes automatically every second
3. Cities are distributed by timezone:
   - 🌎 **Americas:** New York, Los Angeles, São Paulo
   - 🇪🇺 **Europe:** London, Paris, Berlin, Moscow
   - 🌏 **Asia:** Dubai, Mumbai, Singapore, Tokyo, Sydney

**Features:**
- ⏱️ Real-time updates
- 💻 Elegant digital display
- 🌍 Complete global coverage

---

### 3️⃣ Live Timestamp

Displays the current Unix timestamp that updates in real-time.

**How to use:**

1. The timestamp is automatically displayed when you open the page
2. Click on the timestamp to copy it to your clipboard
3. The value updates every second

**Common uses:**
- 🔧 Quick API debugging
- 🧪 Testing systems that require current timestamps
- 🔐 Generating temporary tokens

---

### 4️⃣ Delphi Timestamp Converter

A specialized tool for developers working with Borland Delphi or C++ Builder legacy systems.

**How to use:**

1. Enter a standard Unix timestamp
2. The tool automatically converts to Delphi's TDateTime format
3. TDateTime is a double-precision floating-point number

**What is TDateTime?**

Delphi's TDateTime format uses a different time base than Unix:
- 📅 **Delphi Epoch:** December 30, 1899 (while Unix uses January 1, 1970)
- 🔢 **Representation:** integer part = days, decimal part = fraction of day

**Common uses:**
- 💾 Migrating legacy Windows systems
- 🗄️ Integrating with legacy databases
- 📜 Converting historical dates

---

## 🚀 Quick Start Guide

### Finding the current timestamp

The fastest way is to open the main page. The Live Timestamp automatically displays the current Unix timestamp updated in real-time.

### Converting a specific date

1. Go to [https://unix-timestamp.com/tools](/tools)
2. Use the Date Converter
3. Enter the date in `YYYY-MM-DD` or `YYYY-MM-DD HH:mm:ss` format
4. The corresponding timestamp appears immediately

### Copying a timestamp

Simply click on the timestamp value to automatically copy it to your system clipboard.

### Year 2038 problems?

The site correctly handles timestamps beyond 2038 using 64-bit numbers, ensuring future compatibility.

---

## 📚 Technical Information
# Astro Starter Kit: Minimal

```sh
npm create astro@latest -- --template minimal
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
