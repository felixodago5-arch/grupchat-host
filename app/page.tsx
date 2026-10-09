const conversations = [
  { id: 1, name: "Design Team", lastMessage: "Let's finalize the landing page", time: "09:41", unread: 3, active: true },
  { id: 2, name: "Product Sync", lastMessage: "Customer feedback looks positive", time: "Yesterday", unread: 0, active: false },
  { id: 3, name: "Marketing", lastMessage: "Campaign assets are ready", time: "Mon", unread: 1, active: false },
  { id: 4, name: "Support Queue", lastMessage: "Need a quick follow-up", time: "Sun", unread: 0, active: false },
];

const messages = [
  { id: 1, sender: "Alice", text: "Morning team! The new mockup is ready for review.", time: "09:12", mine: false },
  { id: 2, sender: "Me", text: "Looks good. I like the updated layout and spacing.", time: "09:14", mine: true },
  { id: 3, sender: "Sam", text: "We should keep the color palette consistent across the app.", time: "09:16", mine: false },
  { id: 4, sender: "Me", text: "Agreed. I’ll update the final sections before the demo.", time: "09:18", mine: true },
  { id: 5, sender: "Alice", text: "Perfect. Let’s finalize the copy in the next pass.", time: "09:20", mine: false },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto flex h-screen max-w-7xl overflow-hidden border-x border-slate-200 bg-white shadow-sm">
        <aside className="w-full max-w-[320px] border-r border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Workspace</p>
              <h1 className="mt-1 text-xl font-semibold">GrupChat</h1>
            </div>
            <button className="rounded-full bg-slate-900 px-3 py-1.5 text-sm font-medium text-white">
              New
            </button>
          </div>

          <div className="space-y-2 p-3">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                  conversation.active ? "bg-slate-900 text-white" : "bg-transparent hover:bg-slate-200/80"
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${
                    conversation.active ? "bg-white/15 text-white" : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {conversation.name.slice(0, 2).toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold">{conversation.name}</span>
                    <span className={`text-[10px] ${conversation.active ? "text-slate-300" : "text-slate-400"}`}>
                      {conversation.time}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <span className={`truncate text-xs ${conversation.active ? "text-slate-300" : "text-slate-500"}`}>
                      {conversation.lastMessage}
                    </span>
                    {conversation.unread > 0 && (
                      <span className="rounded-full bg-emerald-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                        {conversation.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col bg-white">
          <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Conversation</p>
              <h2 className="mt-1 text-lg font-semibold">Design Team</h2>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span className="text-sm text-slate-600">8 online</span>
            </div>
          </header>

          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.mine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                      message.mine ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-800"
                    }`}
                  >
                    {!message.mine && <div className="mb-1 text-xs font-semibold text-slate-500">{message.sender}</div>}
                    <p className="text-sm leading-6">{message.text}</p>
                    <div className={`mt-1 text-[10px] ${message.mine ? "text-slate-300" : "text-slate-400"}`}>
                      {message.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-200 bg-white p-4">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                <button className="rounded-full bg-slate-200 px-2 py-1 text-xs font-medium text-slate-700">+</button>
                <input
                  aria-label="Message input"
                  placeholder="Type your message..."
                  className="flex-1 border-0 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                  defaultValue=""
                />
                <button className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">
                  Send
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
