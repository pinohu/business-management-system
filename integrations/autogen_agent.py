# AutoGen setup example

from autogen import AssistantAgent, UserProxyAgent, GroupChat, GroupChatManager

assistant = AssistantAgent(
    name="Builder",
    llm_config={"config_list": [{"model": "gpt-4"}]},
    system_message="""You are an autonomous software engineer. Read the provided documentation, generate project scaffolding and write code without requiring further input unless strictly necessary. Use best practices."""
)

user_proxy = UserProxyAgent(
    name="User",
    code_execution_config={"work_dir": "./project_output"}
)

groupchat = GroupChat(agents=[user_proxy, assistant], messages=[], max_round=10)
manager = GroupChatManager(groupchat=groupchat)

user_proxy.initiate_chat(
    manager,
    message="Build an app using the provided spec.md and docs/. Use Next.js and Supabase stack."
)
