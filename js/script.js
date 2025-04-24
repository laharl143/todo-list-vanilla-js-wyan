function showDivisionsWithDelay() {
  const cardDivisions = document.querySelectorAll(".card");
  const delay = 300;

  cardDivisions.forEach((card, index) => {
    setTimeout(() => {
      card.style.opacity = 1;
    }, (index + 1) * delay);
  });
}

// Helper function to convert 24-hour time to 12-hour format with AM/PM
function formatTimeTo12Hour(time) {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12; // Convert 0 to 12 for midnight
  return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

function scheduleTaskNotification(task) {
  if (!("Notification" in window)) return;

  let hours = 9;
  let minutes = 0;

  const reminderTime = task.reminderTime || "09:00";
  const [hh, mm] = reminderTime.split(":").map(Number);
  if (!isNaN(hh) && !isNaN(mm)) {
    hours = hh;
    minutes = mm;
  }

  const now = new Date();
  const taskDate = new Date(task.date);
  taskDate.setHours(hours, minutes, 0, 0);

  const timeUntilDue = taskDate - now;

  if (Notification.permission === "denied") {
    alert(`Reminder: ${task.text} is due on ${task.date}`);
    return;
  }

  if (Notification.permission !== "granted") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        scheduleTaskNotification(task); // Retry
      }
    });
    return;
  }

  if (timeUntilDue > 0 && timeUntilDue < 7 * 24 * 60 * 60 * 1000) {
    setTimeout(() => {
      const alarmSound = new Audio("assets/sounds/alarm-clock-90867.wav");
      alarmSound.play().catch((error) => {
        console.error("Audio playback failed:", error);
      });

      new Notification("Task Reminder", {
        body: `${task.text} is due at ${formatTimeTo12Hour(reminderTime)}`,
        icon: "📌",
      });
    }, timeUntilDue);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("duedate").valueAsDate = new Date();
  const taskContainer = document.getElementById("TaskContainer");
  const addButton = document.querySelector(".bx-plus");
  const textInput = document.getElementById("todo");
  const dateInput = document.getElementById("duedate");
  const myDayLink = document.getElementById("o1");
  const thisWeekLink = document.getElementById("o2");
  const thisMonthLink = document.getElementById("o3");
  const otherLink = document.getElementById("o4");
  const titleLink = document.getElementById("header_title");

  if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission();
  }

  // Function to generate a unique numeric ID
  const generateNumericID = () => {
    return Date.now() + Math.floor(Math.random() * 1000);
  };

  // Function to handle data submission
  const saveData = () => {
    const taskDescription = textInput.value;
    const dueDate = dateInput.value;
    const noteInput = document.getElementById("taskNote");
    const taskNote = noteInput.value;

    // Check if both text and date are entered before saving
    if (taskDescription.trim() === "" || dueDate === "") {
      swal({
        title: "Error",
        text: "Please enter both task and due date!",
        icon: "error",
      });
    } else {
      // Generate a unique numeric ID
      const id = generateNumericID();

      // Create a new object representing the to-do task
      const task = {
        id: id,
        text: taskDescription,
        date: dueDate,
        note: taskNote,
        completed: false,
        timestamp: Date.now(), // Shortened timestamp in milliseconds
      };
      scheduleTaskNotification(task);

      // Convert the task object to a JSON string
      const taskData = JSON.stringify(task);

      // Save the JSON data to LocalStorage with the unique ID as the key
      localStorage.setItem(id, taskData);

      // Clear the text and date inputs after saving
      textInput.value = "";
      dateInput.value = "";
      noteInput.value = "";
      displayTasks(currentSection);
    }
  };

  addButton.addEventListener("click", saveData);

  // Add keypress event listener to the text input and date input
  textInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      saveData();
    }
  });

  dateInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      saveData();
    }
  });

  // Function to check if a date is today
  const isToday = (dateString) => {
    const today = new Date();
    const date = new Date(dateString);
    return date.toDateString() === today.toDateString();
  };
  // Function to retrieve tasks from LocalStorage and display them
  const displayTasks = (section, tasksToDisplay) => {
    currentSection = section;
    const tasks = Object.entries(localStorage)
      .filter(([key]) => key !== "userPreferences")
      .map(([, tasks]) => JSON.parse(tasks));
    const tasksToRender = tasksToDisplay || tasks;
    tasks.sort((a, b) => new Date(a.date) - new Date(b.date));
    const todayDate = new Date().toLocaleDateString("en-CA");

    // Filter tasks based on the selected section
    const filteredTasks = tasksToRender.filter((task) => {
      switch (section) {
        case "myDay":
          titleLink.textContent = "My Day";
          return task.date === todayDate;

        case "thisWeek":
          titleLink.textContent = "Current Week";
          const getStartOfWeek = (date) => {
            const day = date.getDay();
            return new Date(
              date.getFullYear(),
              date.getMonth(),
              date.getDate() - day
            );
          };
          const getEndOfWeek = (date) => {
            const day = date.getDay();
            return new Date(
              date.getFullYear(),
              date.getMonth(),
              date.getDate() + (6 - day)
            );
          };
          const today = new Date();
          const startOfWeek = getStartOfWeek(today);
          const endOfWeek = getEndOfWeek(today);
          const taskDate = new Date(task.date);
          return taskDate >= startOfWeek && taskDate <= endOfWeek;

        case "thisMonth":
          titleLink.textContent = "Current Month";

          const getStartOfMonth = (date) =>
            new Date(date.getFullYear(), date.getMonth(), 1);
          const getEndOfMonth = (date) =>
            new Date(date.getFullYear(), date.getMonth() + 1, 0);

          const startOfMonth = getStartOfMonth(new Date());
          const endOfMonth = getEndOfMonth(new Date());

          const taskDateObj = new Date(task.date);

          return taskDateObj >= startOfMonth && taskDateObj <= endOfMonth;

        case "other":
          titleLink.textContent = "All tasks";
          return true;

        default:
          return false;
      }
    });

    taskContainer.innerHTML = filteredTasks
      .map((task) => {
        const taskDate = new Date(task.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set today's time to midnight for comparison
        const isTaskOverdue =
          taskDate < today && !task.completed; // Exclude tasks due today
        const isDueToday =
          taskDate.toDateString() === today.toDateString(); // Check if the task is due today

        // Retrieve reminder time if available
        const reminderTime = task.reminderTime
          ? formatTimeTo12Hour(task.reminderTime)
          : "No reminder set";

        return `
          <div class="card align ${isTaskOverdue ? 'overdue' : ''}" data-task-id="${task.id}" style="background-color: ${
          task.completed ? "#d4edda" : isTaskOverdue ? "#ffcccc" : ""
        };">
            <input type="checkbox" name="task" id="${task.id}" ${
          task.completed ? "checked" : ""
        } ${isTaskOverdue ? "disabled" : ""}>
            <div ${
              task.completed
                ? 'class="marker done"'
                : `class="marker ${isTaskOverdue ? 'overdue-marker' : ''}"`
            }>
              <span ${
                isTaskOverdue ? 'class="crossed-out"' : ''
              }>${task.text}</span>
              ${
                task.note
                  ? `<small class="task-note ${
                      isTaskOverdue ? 'crossed-out' : ''
                    }">${task.note}</small>`
                  : ""
              }
              <p id="taskDate" class="date ${
                isDueToday ? "today" : ""
              } ${isTaskOverdue ? "overdue-date" : ""}">
                ${
                  isTaskOverdue
                    ? '<i class="bx bx-error"></i> Incomplete Task'
                    : isDueToday
                    ? "Due Today!"
                    : "<i class='bx bx-calendar-alt'></i> " + task.date
                }
              </p>
              <p class="reminder ${
                isTaskOverdue ? "overdue-date" : ""
              }"><i class="bx bx-bell"></i> ${reminderTime}</p>
              <input type="date" id="hiddenDatePicker" style="display: none;" />
            </div>
            <i class="bx bx-trash-alt" data-task-id="${task.id}"></i>
          </div>
        `;
      })
      .join("");

    // Add event listeners to checkboxes
    const checkboxes = taskContainer.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", (event) => {
        const taskId = event.target.id;
        const taskData = JSON.parse(localStorage.getItem(taskId));

        // Update the task's completed status
        taskData.completed = event.target.checked;

        // Save the updated task back to localStorage
        localStorage.setItem(taskId, JSON.stringify(taskData));

        // Re-render the tasks to reflect the updated status
        displayTasks(currentSection);
      });
    });

    // Add event listeners to task dates
    const taskDates = taskContainer.querySelectorAll(".date");
    taskDates.forEach((dateElement) => {
      dateElement.addEventListener("click", (event) => {
        const taskId = event.target.closest(".card").dataset.taskId;
        const task = JSON.parse(localStorage.getItem(taskId));

        if (task) {
          const taskDate = new Date(task.date);
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          // Prevent editing if the task is overdue
          if (taskDate < today && !task.completed) {
            swal("Editing is disabled for overdue tasks.", {
              icon: "warning",
            });
            return;
          }

          // Create a hidden date picker dynamically
          const hiddenDatePicker = document.createElement("input");
          hiddenDatePicker.type = "date";
          hiddenDatePicker.value = task.date;
          hiddenDatePicker.style.position = "absolute";
          hiddenDatePicker.style.opacity = "0";
          hiddenDatePicker.style.pointerEvents = "none";

          // Append the hidden date picker to the body
          document.body.appendChild(hiddenDatePicker);

          // Show the date picker
          hiddenDatePicker.showPicker();

          // Listen for changes in the date picker
          hiddenDatePicker.addEventListener("change", function () {
            const selectedDate = this.value;

            // Ask for confirmation before updating the date
            swal({
              title: "Are you sure?",
              text: `Update the due date from ${task.date} to ${selectedDate}.`,
              icon: "info",
              buttons: ["Cancel", "Yes"],
            }).then((willChangeDate) => {
              if (willChangeDate) {
                // Update the date in local storage
                task.date = selectedDate;
                localStorage.setItem(taskId, JSON.stringify(task));

                // Refresh the display
                displayTasks(currentSection);

                // Show success message automatically for 2 seconds
                swal({
                  title: "Date Updated!",
                  text: `Due date for "${task.text}" has been updated to ${selectedDate}.`,
                  icon: "success",
                  buttons: false,
                  timer: 2000, // Display for 2 seconds
                });
              }

              // Remove the hidden date picker after use
              hiddenDatePicker.remove();
            });
          });

          // Remove the hidden date picker if the user cancels
          hiddenDatePicker.addEventListener("blur", () => {
            hiddenDatePicker.remove();
          });
        }
      });
    });

    // Add event listeners to trash icons
    const trashIcons = taskContainer.querySelectorAll(".bx-trash-alt");
    trashIcons.forEach((icon) => {
      icon.addEventListener("click", (event) => {
        const taskId = event.target.getAttribute("data-task-id");

        // Show confirmation popup
        swal({
          title: "Are you sure?",
          text: "Do you really want to delete this task?",
          icon: "warning",
          buttons: ["Cancel", "Delete"],
          dangerMode: true,
        }).then((willDelete) => {
          if (willDelete) {
            // Remove the task from localStorage
            localStorage.removeItem(taskId);

            // Re-render the tasks to reflect the deletion
            displayTasks(currentSection);

            // Show task deleted confirmation popup automatically for 2 seconds
            swal({
              title: "Task Deleted!",
              text: "The task has been successfully deleted.",
              icon: "success",
              buttons: false,
              timer: 2000, // Display for 2 seconds
            });
          }
        });
      });
    });

    // Add event listeners to reminder times for setting reminders
    taskContainer.addEventListener("click", (event) => {
      const reminderElement = event.target.closest(".reminder");
      if (reminderElement) {
        const taskElement = reminderElement.closest(".card");
        const taskId = taskElement.dataset.taskId;
        const task = JSON.parse(localStorage.getItem(taskId));

        if (task) {
          const taskDate = new Date(task.date);
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          // Prevent editing if the task is overdue
          if (taskDate < today && !task.completed) {
            swal("Editing is disabled for overdue tasks.", {
              icon: "warning",
            });
            return;
          }

          // Create a hidden time picker dynamically
          const hiddenTimePicker = document.createElement("input");
          hiddenTimePicker.type = "time";
          hiddenTimePicker.style.position = "absolute";
          hiddenTimePicker.style.opacity = "0";
          hiddenTimePicker.style.pointerEvents = "none";

          // Append the hidden time picker to the body
          document.body.appendChild(hiddenTimePicker);

          // Show the time picker
          hiddenTimePicker.showPicker();

          // Listen for changes in the time picker
          hiddenTimePicker.addEventListener("change", function () {
            const selectedTime = this.value;

            // Convert the selected time to 12-hour format
            const formattedTime = formatTimeTo12Hour(selectedTime);

            // Show a confirm button for setting the reminder
            swal({
              title: "Confirm Reminder",
              text: `Set a reminder for "${task.text}" at ${formattedTime}?`,
              icon: "info",
              buttons: {
                cancel: "Cancel",
                confirm: "Set Reminder",
              },
            }).then((willSetReminder) => {
              if (willSetReminder) {
                // Save the selected time as the reminder time
                task.reminderTime = selectedTime;
                localStorage.setItem(taskId, JSON.stringify(task));

                // Schedule the reminder
                scheduleTaskNotification(task);

                // Automatically show a success popup for 2 seconds
                swal({
                  title: "Reminder Set!",
                  text: `Reminder for "${task.text}" is set at ${formattedTime}.`,
                  icon: "success",
                  buttons: false,
                  timer: 2000, // Display for 2 seconds
                });

                // Refresh the display to show the updated reminder time
                displayTasks(currentSection);
              }

              // Remove the hidden time picker after use
              hiddenTimePicker.remove();
            });
          });

          // Remove the hidden time picker if the user cancels
          hiddenTimePicker.addEventListener("blur", () => {
            hiddenTimePicker.remove();
          });
        }
      }
    });

    showDivisionsWithDelay();
  };

  const buttonsDiv = document.querySelector(".buttons");
  buttonsDiv.addEventListener("click", () => {
    swal({
      title: "Delete all data?",
      text: "Once deleted, you will not be able to recover this data!",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        // Get all keys from localStorage
        const keys = Object.keys(localStorage);

        // Filter out the userPreferences key
        const keysToKeep = keys.filter((key) => key !== "userPreferences");

        // Clear localStorage except for userPreferences
        keysToKeep.forEach((key) => localStorage.removeItem(key));

        // Clear the taskContainer
        taskContainer.innerHTML = "";

        // Show all tasks deleted confirmation popup automatically for 2 seconds
        swal({
          title: "All Tasks Deleted!",
          text: "All tasks have been successfully deleted.",
          icon: "success",
          buttons: false,
          timer: 2000, // Display for 2 seconds
        });
      }
    });
  });

  const logoutLink = document.getElementById("logoutLink");

  logoutLink.addEventListener("click", () => {
    swal({
      title: "Are you sure?",
      text: "Logging out will delete your profile name and email.",
      icon: "warning",
      buttons: ["Cancel", "Logout"],
      dangerMode: true,
    }).then((willLogout) => {
      if (willLogout) {
        // User clicked "Logout"
        // Remove user preferences from local storage
        // localStorage.removeItem("userPreferences");

        // Clear ALL local storage completely
        localStorage.clear();

        // Refresh the current page
        window.location.reload();
      } else {
        // User clicked "Cancel"
        // Do nothing or handle accordingly
      }
    });
  });

  function getUserPreferences() {
    const storedPreferences = localStorage.getItem("userPreferences");
    const defaultPreferences = {
      name: "Student name",
      email: "student@aclc.com",
    };

    return storedPreferences
      ? JSON.parse(storedPreferences)
      : defaultPreferences;
  }
  // Function to set user preferences in localStorage
  function setUserPreferences(name, email) {
    const preferences = { name, email };
    localStorage.setItem("userPreferences", JSON.stringify(preferences));
  }

  // Function to prompt the user for their name and email using SweetAlert
  function promptForNameAndEmail() {
    swal({
      title: "Enter your information",
      content: {
        element: "div",
        attributes: {
          innerHTML: `
          <div class="form__group field">
            <input type="input" class="form__field" placeholder="Name" id="swal-input-name" required="">
            <label for="swal-input-name" class="form__label">Name</label>
          </div>
          <div class="form__group field">
            <input type="input" class="form__field" placeholder="Email" id="swal-input-email" required="">
            <label for="swal-input-email" class="form__label">Email</label>
          </div>
        `,
        },
      },
      buttons: {
        cancel: "Cancel",
        confirm: "Save",
      },
      closeOnClickOutside: false,
    }).then((result) => {
      if (result && result.dismiss !== "cancel") {
        const name = document.getElementById("swal-input-name").value;
        const email = document.getElementById("swal-input-email").value;

        // Set default values if the user didn't enter any details
        const finalName = name || "Mr John Doe ";
        const finalEmail = email || "john@gmail.com";

        setUserPreferences(finalName, finalEmail);
        displayProfileData();

        Object.entries(localStorage).forEach(([key, value]) => {
          if (key !== "userPreferences") {
            const task = JSON.parse(value);
            if (!task.completed) {
              scheduleTaskNotification(task);
            }
          }
        });
      }
    });
  }

  // Function to display user profile data
  function displayProfileData() {
    const preferences = getUserPreferences();

    const nameElement = document.getElementById("name");
    const emailElement = document.getElementById("email");

    nameElement.textContent = preferences.name;
    emailElement.textContent = preferences.email;
  }

  // Check if user preferences are already set
  const preferences = getUserPreferences();

  if (
    preferences.name === "Student name" &&
    preferences.email === "student@aclc.com"
  ) {
    // If preferences are default, prompt the user for their name and email
    promptForNameAndEmail();
  }

  // Call the function to display profile data
  displayProfileData();

  // Function to handle section link click and display tasks
  const handleSectionLinkClick = (section, linkElement) => {
    displayTasks(section);
    toggleMenu();

    // Remove the event listener for the clicked section link
    linkElement.removeEventListener("click", () =>
      handleSectionLinkClick(section, linkElement)
    );
  };

  // Event listeners for section links
  myDayLink.addEventListener("click", function () {
    handleSectionLinkClick("myDay", myDayLink);
  });
  thisWeekLink.addEventListener("click", function () {
    handleSectionLinkClick("thisWeek", thisWeekLink);
  });
  thisMonthLink.addEventListener("click", function () {
    handleSectionLinkClick("thisMonth", thisMonthLink);
  });
  otherLink.addEventListener("click", function () {
    handleSectionLinkClick("other", otherLink);
  });

  const searchInput = document.getElementById("search");

  // Add event listener for search functionality
  searchInput.addEventListener("input", (event) => {
    const searchTerm = event.target.value.toLowerCase();

    // Filter tasks based on the search term
    const tasks = Object.entries(localStorage)
      .filter(([key]) => key !== "userPreferences")
      .map(([, task]) => JSON.parse(task));

    const filteredTasks = tasks.filter((task) =>
      task.text.toLowerCase().includes(searchTerm)
    );

    // Display only the filtered tasks
    displayTasks(currentSection, filteredTasks);
  });

  let currentSection = "myDay";
  displayTasks(currentSection);

  const burgerIcon = document.getElementById("burgerIcon");
  const containerLeft = document.getElementById("containerLeft");

  var toggleMenu = () => {
    containerLeft.classList.toggle("v-class");
    burgerIcon.classList.toggle("cross");
  };

  burgerIcon.addEventListener("click", toggleMenu);

  document.body.addEventListener("click", (event) => {
    const target = event.target;

    // Check if the clicked element is not inside the containerLeft
    if (!containerLeft.contains(target) && !burgerIcon.contains(target)) {
      containerLeft.classList.remove("v-class");
      burgerIcon.classList.remove("cross");
    }
  });

  // Function to handle long notes
  const handleLongNotes = () => {
    const noteInput = document.getElementById("taskNote");

    noteInput.addEventListener("input", () => {
      if (noteInput.scrollWidth > noteInput.clientWidth) {
        swal({
          title: "Longer Notes",
          content: {
            element: "textarea",
            attributes: {
              value: noteInput.value,
              rows: 5,
              style: "width: 100%;",
            },
          },
          buttons: {
            cancel: "Cancel",
            confirm: "Save",
          },
        }).then((result) => {
          if (result) {
            const textarea = document.querySelector(".swal-content__textarea");
            if (textarea) {
              noteInput.value = textarea.value; // Update the note input with the edited value
            }
          }
        });
      }
    });
  };

  // Call the function to handle long notes
  handleLongNotes();
});
