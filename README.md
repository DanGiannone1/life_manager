# life_manager

This is a personal project to help me manage my life. The main goal is to help me manage my tasks and goals and stay organized and productive. The main page will be blank for now. There will be a sidebar to navigate to the different pages.

The task page will be the second page. It will have a main grid area for tasks. There will be two types of tasks: 

- Recurring tasks: These are tasks that happen on a regular basis. For example, clean shower, etc. 
- One-time tasks: These are tasks that happen once and are not repeated. For example, sell my bike. 

We should have a data model in cosmos DB. When we mark a recurring task completed, it should be marked as completed for the current date and then it should show back up once the elapsed time since last completion is greater than the frequency of the task. 


## Tech Stack

### Backend

- Python
- Flask

### Frontend

- React
- NextJS
- TailwindCSS Styling
- Shadcn Components
- Lucide Icons

### Database

- CosmosDB
