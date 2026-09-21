## Front-end Setup & Initial Dependencies
The initial setup for the front-end workspace uses React and Vite. All necessary dependencies to meet the project requirements have been installed and configured.

Below is the list of the installed libraries and their specific purpose for this project:

- vite & react: Initialized the project template to provide a fast development environment and a solid component-based architecture.

- axios: Installed to handle HTTP requests and manage API communications with our FastAPI back-end.

- react-router-dom: Implemented to manage client-side routing, enabling navigation between different views (Login, Nutritionist Dashboard, Patient View,etc) and protecting private routes based on user roles.

- recharts: Added to render responsive and interactive charts for the analytical reports required by the system.

- jspdf & html2canvas: Integrated to fulfill the requirement of exporting tables, reports, and menus to PDF format directly from the browser.

- i18next & react-i18next: Configured to support multi-language capabilities, ensuring the application is adaptable to different users.

- vitest, jsdom & @testing-library: Set up the testing environment to write and run unit tests for the frontend components, ensuring code quality and stability.

## Instructions for the Team:
To sync your local environment, please pull these changes and run **npm install** inside the frontend folder. This will automatically download all the required packages listed above.