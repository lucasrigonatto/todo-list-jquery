var API = "https://fewd-todolist-api.onrender.com/tasks";
var API_KEY = "241";
var LOCAL_KEY = "todo-list-jquery";

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function localTasks() {
  try {
    var saved = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    return [];
  }
}

function saveLocal(tasks) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(tasks));
}

function paint(tasks, note) {
  var list = $(".do-list");
  list.empty();
  tasks
    .slice()
    .sort(function (a, b) {
      return new Date(b.created_at) - new Date(a.created_at);
    })
    .forEach(function (item) {
      var done = item.completed ? " list-group-item-dark" : "";
      list.append(
        '<li id="' +
          escapeHtml(item.id) +
          '" class="list-group-item taskItem' +
          done +
          '"><button type="button" class="btn btn-outline-primary d-inline checkButton"><i class="fas fa-check"></i></button><div class="m-3 taskText d-inline h5">' +
          escapeHtml(item.content) +
          '</div><button type="button" class="btn btn-danger d-inline float-right delete"><i class="fas fa-times"></i></button></li>',
      );
    });
  $("#status").text(note || "");
}

function refreshList() {
  $("#status").text("Carregando tarefas…");
  $.ajax({
    type: "GET",
    url: API + "?api_key=" + API_KEY,
    dataType: "json",
    timeout: 8000,
  })
    .done(function (response) {
      paint(response.tasks || [], "");
    })
    .fail(function () {
      paint(
        localTasks(),
        "A API do curso não respondeu. Esta lista está salva só neste navegador.",
      );
    });
}

$(document).on("click", ".btn.addTask", function () {
  var input = $(".task-input");
  var content = input.val().trim();
  if (!content) {
    $("#status").text("Escreva uma tarefa antes de adicionar.");
    return;
  }
  $.ajax({
    type: "POST",
    url: API + "?api_key=" + API_KEY,
    contentType: "application/json",
    dataType: "json",
    data: JSON.stringify({ task: { content: content } }),
    timeout: 8000,
  })
    .done(function () {
      input.val("");
      refreshList();
    })
    .fail(function () {
      var tasks = localTasks();
      tasks.push({
        id: "local-" + Date.now(),
        content: content,
        completed: false,
        created_at: new Date().toISOString(),
      });
      saveLocal(tasks);
      input.val("");
      paint(tasks, "Salvei esta tarefa neste navegador.");
    });
});

$(document).on("keydown", ".task-input", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    $(".btn.addTask").trigger("click");
  }
});

$(document).on("click", ".btn.delete", function () {
  var item = $(this).closest("li");
  var id = item.attr("id");
  if (String(id).indexOf("local-") === 0) {
    saveLocal(
      localTasks().filter(function (task) {
        return String(task.id) !== String(id);
      }),
    );
    item.remove();
    return;
  }
  $.ajax({
    type: "DELETE",
    url: API + "/" + encodeURIComponent(id) + "?api_key=" + API_KEY,
    timeout: 8000,
  })
    .done(function () {
      item.remove();
    })
    .fail(function () {
      $("#status").text("Não consegui apagar essa tarefa.");
    });
});

$(document).on("click", ".btn.checkButton", function () {
  var item = $(this).closest("li");
  var id = item.attr("id");
  var completed = item.hasClass("list-group-item-dark");
  if (String(id).indexOf("local-") === 0) {
    var tasks = localTasks().map(function (task) {
      if (String(task.id) === String(id)) task.completed = !completed;
      return task;
    });
    saveLocal(tasks);
    paint(tasks, "Alteração salva neste navegador.");
    return;
  }
  var action = completed ? "mark_active" : "mark_complete";
  $.ajax({
    type: "PUT",
    url: API + "/" + encodeURIComponent(id) + "/" + action + "?api_key=" + API_KEY,
    timeout: 8000,
  })
    .done(refreshList)
    .fail(function () {
      $("#status").text("Não consegui atualizar essa tarefa.");
    });
});

$(document).ready(refreshList);
