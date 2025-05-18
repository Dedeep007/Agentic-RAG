# Agentic RAG System

Agentic RAG (Retrieval-Augmented Generation) is a local system designed to enhance the capabilities of large language models (LLMs) by integrating retrieval-based context refinement. This project provides a user-friendly interface for interacting with the system and visualizing the flow of data between components.

## Features

- **Interactive Chat Interface**: Communicate with the RAG system using a clean and modern chat UI.
- **Flowchart Visualization**: Understand the data flow with a visually appealing flowchart.
- **Customizable Parameters**: Adjust the number of worker agents and decision loops for fine-tuning.
- **Feedback Loop**: Workers provide feedback to the master agent for iterative refinement.
- **Local Deployment**: Run the system locally for privacy and control.

## Project Structure

```
Agentic_RAG/
├── app.py                # Backend entry point
├── LLM_RAG.py           # Core logic for LLM and RAG integration
├── master_agent.py      # Master agent logic
├── retrieval_agent.py   # Worker agent logic
├── requirements.txt     # Python dependencies
├── client/              # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   └── ChatUI.jsx  # Main UI component
│   │   └── ...
└── ...
```

## Installation

### Prerequisites

- Python 3.8+
- Node.js 14+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd Agentic_RAG
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the backend server:
   ```bash
   python app.py
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd Agentic_RAG/client
   ```
2. Install Node.js dependencies:
   ```bash
   npm install
   ```
3. Start the React development server:
   ```bash
   npm start
   ```

## Usage

1. Open the frontend in your browser (usually at `http://localhost:3000`).
2. Enter your Gemini API key and configure the number of worker agents and decision loops.
3. Type your prompt and interact with the system.
4. View the flowchart to understand the data flow.

## Contribution

Contributions are welcome! Feel free to fork the repository, submit pull requests, or open issues to help improve this project.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by advancements in Retrieval-Augmented Generation (RAG).
- Built with React, Flask, and modern web technologies.

## Contact

For questions or feedback, please reach out via the [GitHub repository](https://github.com/Dedeep007/Agentic-RAG).
