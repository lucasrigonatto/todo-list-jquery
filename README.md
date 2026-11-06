# To Do List

A jQuery task list that creates, completes, and deletes tasks through a REST API.

## What problem did I work on?

I wanted the list to survive a reload, instead of living only in the page. Adding, completing, and deleting a task each call the API and then refresh the list.

## What is included?

On load the page requests the tasks and shows the newest first. Add sends the trimmed text and ignores a blank field. Enter submits the form. The check button toggles complete and active. Delete removes the task. Task text is inserted as text, not as HTML. Completed rows use a darker list style. If the course API does not respond, the page keeps a local copy in this browser and says so.

## How can I check it?

Serve the folder with any static HTTP server:

```bash
python -m http.server 8080
```

Open http://localhost:8080. Add a task, mark it done, delete it, and reload to confirm the API still has the change. The list depends on the course API at `fewd-todolist-api.onrender.com`. If that service is down, the page stays empty. There is no package install or build step.

## Scope

This is the earlier jQuery version of the task list. The later React version, with its own tests, is in [To-Do-List](https://github.com/lucasrigonatto/To-Do-List). This page does not edit the task text.

Live demo: https://todolistabudtest.netlify.app/
