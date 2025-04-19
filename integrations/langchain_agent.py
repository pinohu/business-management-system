from langchain.agents import initialize_agent, Tool
from langchain.chat_models import ChatOpenAI
from langchain.tools import ShellTool, FileSearchTool

llm = ChatOpenAI(model_name="gpt-4")

tools = [
    ShellTool(),  # For shell-based project setup
    FileSearchTool(root_dir="./docs")  # To explore project spec files
]

agent = initialize_agent(
    tools,
    llm,
    agent="zero-shot-react-description",
    verbose=True
)

agent.run("Read the project spec and generate full app scaffolding using best practices.")
