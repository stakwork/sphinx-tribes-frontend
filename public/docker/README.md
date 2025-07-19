# Dummy Data Testing Guide

## Overview

This directory contains dummy data files used for testing the chat interface without making actual API calls. This is useful for frontend development and testing without needing a backend connection.

## How to Use

1. Open the chat interface
2. Type `@Testing` in the input field
3. Send the message
4. The application will load dummy data from the JSON files in this directory instead of making API calls

## Available Dummy Data Files

### `chat_dummy_data.json`

Contains artifacts for various types of chat content:

- Text artifacts (markdown, code)
- Visual artifacts (screens)
- Action artifacts (buttons and interactive elements)
- SSE connection metadata

### `sselogs_dummy_data.json`

Contains server-sent events (SSE) log data in the same format as the production API response.

## Customizing Dummy Data

You can modify the JSON files to test different scenarios:

1. Edit `chat_dummy_data.json` to change the chat artifacts (visual screens, code snippets, etc.)
2. Edit `sselogs_dummy_data.json` to modify the SSE logs data

## Example

When you send a message with `@Testing`, the application will:

1. Load artifacts from `chat_dummy_data.json`
2. Load SSE logs from `sselogs_dummy_data.json`
3. Display the artifacts in the appropriate tabs (Logs, Code, Screen, Text)

## Notes

- The testing mode prevents auto-refresh and WebSocket updates from clearing the dummy data
- The input field will be cleared after sending `@Testing` for easier repeated testing
- When using `@Testing`, no actual API calls will be made
