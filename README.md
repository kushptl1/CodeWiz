# Codewiz

This repository contains a project named **CodeWiz**, a web application built with **React**, **TypeScript**, and **TailwindCSS**. The application leverages **Firebase** for authentication, **AWS Lambda** for backend processing, and integrates **AWS Bedrock** for code refactoring. Additionally, **AWS SageMaker** is used for semantic validation of the generated code, and **DynamoDB** logs all user activity. **S3** is utilized for storing user data securely in a private subnet accessible via a **Bastion EC2 Host**.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Directory Structure](#directory-structure)
4. [Installation](#installation)
5. [Configuration](#configuration)
6. [Usage](#usage)
7. [API Integration](#api-integration)
8. [Deployment](#deployment)
9. [License](#license)

## Project Overview

**CodeWiz** is a web-based code refactoring tool that transforms code from one programming language to another using AI models hosted on **AWS Bedrock**. The system also includes **semantic code validation** using **SageMaker**'s **CodeBERT** model to ensure the quality and correctness of the generated code. All user actions are logged in **DynamoDB**, and **S3** is used for secure storage of generated code under each user's ID.

### Architecture Diagram

The system architecture is as follows:

![Architecture Diagram](/src/assets/Project.drawio.png.png)

### Flow

1. **Frontend (React App)**: The frontend communicates with the **AWS API Gateway**, which triggers a **Lambda function** to:
   - Interact with **AWS Bedrock** for code refactoring.
   - Send the refactored code to **SageMaker** for semantic validation.
   - Store the refactored code in **S3** under the user's directory for debugging.
   - Log user activity in **DynamoDB**.

2. **Lambda**: The Lambda function:
   - Validates the request.
   - Calls **Bedrock** for code transformation.
   - Sends the transformed code to **SageMaker** (using a **CodeBERT** model) to check for semantic accuracy.
   - If the code passes the semantic check, it is returned to the frontend. If it doesn't, the Lambda function requests **Bedrock** to regenerate the code.
   - Logs the generated code in **S3** under the user’s ID.

3. **S3**: The **S3 bucket** is deployed in a private subnet and is only accessible via a **Bastion Host** for secure access.

4. **DynamoDB**: Logs all user logins and actions along with timestamps for auditing and debugging purposes.

## Tech Stack

- **Frontend**: 
  - **React** (with TypeScript)
  - **TailwindCSS** (for styling)
  - **Vite** (for fast bundling and development server)
  
- **Backend**:
  - **AWS Lambda** (for handling the code transformation logic)
  - **AWS Bedrock** (for using pre-trained AI models to refactor and convert code)
  - **AWS SageMaker** (for semantic validation using **CodeBERT**)
  - **API Gateway** (for exposing the Lambda function to the frontend)
  
- **Authentication**:
  - **Firebase Authentication** (for user login and signup)

- **Others**:
  - **Terraform** (for infrastructure as code)
  - **ESLint** (for code linting)
  - **PostCSS** (for processing CSS)

- **Database & Storage**:
  - **DynamoDB** (for logging user activities)
  - **S3** (for storing user code securely)

## Directory Structure

The repository follows the following directory structure:

```
└── aswinkumar1-codewiz/
    ├── README.md              # Project documentation
    ├── eslint.config.js        # ESLint configuration
    ├── index.html             # Main HTML file
    ├── package.json           # NPM dependencies and scripts
    ├── postcss.config.js      # PostCSS configuration
    ├── tailwind.config.js     # TailwindCSS configuration
    ├── tsconfig.app.json      # TypeScript configuration for the app
    ├── tsconfig.json          # Base TypeScript configuration
    ├── tsconfig.node.json     # TypeScript configuration for Node.js
    ├── vite.config.ts         # Vite configuration for bundling
    ├── public/                # Public assets (e.g., images, favicon)
    ├── src/                   # Source code for the React app
    │   ├── App.tsx            # Main React component
    │   ├── index.css          # Global styles
    │   ├── main.tsx           # Entry point for React app
    │   ├── vite-env.d.ts      # TypeScript declaration file for Vite
    │   └── config/            # Firebase configuration
    │       └── firebase-config.ts # Firebase initialization
    ├── Terraform/             # Infrastructure code using Terraform
    │   ├── main.tf            # Terraform configuration
    │   └── lambda/            # AWS Lambda function for backend
    │       └── lambda_function.py  # Python code for Lambda function
    └── .bolt/                 # Bolt configuration for AI integration
        ├── config.json        # Bolt config file
        └── prompt             # Prompt file for AI
```

## Installation

### Prerequisites

- **Node.js**: Make sure you have **Node.js** (>=14.x) installed.
- **Terraform**: Ensure that **Terraform** is installed to deploy infrastructure.
- **Firebase**: You need a Firebase project to use Firebase Authentication.
- **AWS CLI**: Install the AWS CLI to interact with your AWS resources and Lambda functions.

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/aswinkumar1/aswinkumar1-codewiz.git
   cd aswinkumar1-codewiz
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Firebase:
   - Go to the [Firebase Console](https://console.firebase.google.com/).
   - Create a new Firebase project and enable Firebase Authentication.
   - Replace the Firebase credentials in `src/config/firebase-config.ts`.

4. Set up AWS Lambda and S3:
   - Deploy the infrastructure using the provided **Terraform** files in the `Terraform/` directory.
   - Make sure the Lambda function has the necessary permissions to access S3, DynamoDB, and SageMaker.

5. Run the development server:
   ```bash
   npm run dev
   ```

## Configuration

### Firebase
- Configure Firebase Authentication by replacing the placeholder credentials in `src/config/firebase-config.ts`.

### AWS Lambda
- Configure the Lambda function and ensure the correct permissions are set for AWS services like S3, DynamoDB, SageMaker, and Bedrock.

### AWS SageMaker
- The Lambda function uses **SageMaker** to run **CodeBERT** for semantic code validation.
- The `lambda_function.py` interacts with SageMaker to check the validity of the refactored code.

### TailwindCSS
- The app uses **TailwindCSS** for styling. You can customize the configuration in `tailwind.config.js` to match your design preferences.

### AWS API Gateway
- The API Gateway is used to expose the Lambda function to the frontend. The **Lambda function URL** is invoked by the frontend to process code transformations.

## Usage

Once the app is running:

1. **Login**: Sign in using your Google account through Firebase Authentication.
2. **Code Editor**: Paste or write your code in the editor.
3. **Convert Code**: Select the source and target programming languages and click "Convert Code" to transform the code.
4. **Converted Code**: The converted code will appear in the editor, and the system will validate its semantics using SageMaker. If the code is valid, it will be shown to the user. If not, a new refactor request will be triggered.

## API Integration

The frontend calls the **AWS API Gateway** endpoint, which triggers the **Lambda function**. The Lambda function uses **AWS Bedrock** for code refactoring and **AWS SageMaker** for semantic validation via the **CodeBERT** model.

### Frontend API Call

Here’s the code that handles the API call in the frontend:

```ts
const handleConvert = async () => {
  if (handleError()) return;

  try {
    const response = await fetch(
      'https://v7vk9k1rd1.execute-api.us-east-1.amazonaws.com/convert',
      {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          UserID: user?.uid,
          sourceLang,
          targetLang,
          sourceCode
        })
      }
    );

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Conversion failed');
    }

    const data = await response.json();
    setConvertedCode(data.converted_code);  // Display the refactored code
  } catch (error) {
    console.error('Error calling the Lambda API:', error);
    alert((error as Error).message);
  }
};
```

### Lambda Function Logic

The Lambda function processes the code by:

1. Receiving the **source code**, **source language**, **target language**, and **user ID** from the request.
2. Formulating a prompt for **AWS Bedrock** to refactor the code.
3. Using **AI models** to convert the code.
4. Sending the converted code to **AWS SageMaker (CodeBERT)** for semantic validation.
5. Returning the refactored code if it passes semantic validation, or requesting **Bedrock** to regenerate the code.
6. Logging the transformed code in **S3** under the user’s ID.

The Lambda function also logs the transformation to **DynamoDB** and stores the refactored code in **S3** for future reference.

## Deployment

### Deployment with Vercel

1. Push your changes to GitHub.
2. Go to [Vercel](https://vercel.com/), connect your GitHub repository, and deploy the app.

### AWS Lambda Deployment with Terraform

To deploy the Lambda function and other resources:

1. Navigate to the `Terraform/` folder.
2. Run the following commands:
   ```bash
   terraform init
   terraform apply
   ```

This will create the necessary AWS resources, including the Lambda function.

## License

This project is licensed under the MIT License.

