class Task {
    constructor(name, dueDate, customReminderDays = []) {
        this.name = name;
        this.dueDate = dueDate;
        this.customReminderDays = customReminderDays; // Array of days for custom reminders
    }

    // Additional methods for Task can be added here
}

module.exports = Task;