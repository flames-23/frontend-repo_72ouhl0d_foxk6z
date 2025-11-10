import { useEffect, useMemo, useState } from 'react'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function Section({ title, children, actions }) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        {actions}
      </div>
      {children}
    </div>
  )
}

function Input({ label, ...props }) {
  return (
    <label className="block">
      <span className="text-sm text-gray-600">{label}</span>
      <input
        {...props}
        className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
      />
    </label>
  )
}

function Textarea({ label, ...props }) {
  return (
    <label className="block">
      <span className="text-sm text-gray-600">{label}</span>
      <textarea
        {...props}
        className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
      />
    </label>
  )
}

function Badge({ children }) {
  return <span className="inline-block text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">{children}</span>
}

function App() {
  const [tab, setTab] = useState('questions')

  // Questions state
  const [qForm, setQForm] = useState({ text: '', category: '', difficulty: '', role: '', type: '', expected_answer: '', tags: '' })
  const [questions, setQuestions] = useState([])
  const [qLoading, setQLoading] = useState(false)

  // Templates state
  const [tForm, setTForm] = useState({ title: '', role: '', seniority: '', description: '', question_ids: [] })
  const [templates, setTemplates] = useState([])
  const [tLoading, setTLoading] = useState(false)

  // Interviews state
  const [iForm, setIForm] = useState({ candidate_name: '', candidate_email: '', role: '', template_id: '', question_ids: [], scheduled_at: '', mode: '', notes: '' })
  const [interviews, setInterviews] = useState([])
  const [iLoading, setILoading] = useState(false)

  useEffect(() => {
    fetchQuestions()
    fetchTemplates()
    fetchInterviews()
  }, [])

  async function fetchQuestions() {
    setQLoading(true)
    const res = await fetch(`${BACKEND_URL}/api/questions`)
    const data = await res.json()
    setQuestions(data)
    setQLoading(false)
  }

  async function fetchTemplates() {
    setTLoading(true)
    const res = await fetch(`${BACKEND_URL}/api/templates`)
    const data = await res.json()
    setTemplates(data)
    setTLoading(false)
  }

  async function fetchInterviews() {
    setILoading(true)
    const res = await fetch(`${BACKEND_URL}/api/interviews`)
    const data = await res.json()
    setInterviews(data)
    setILoading(false)
  }

  async function addQuestion(e) {
    e.preventDefault()
    const payload = { ...qForm, tags: (qForm.tags || '').split(',').map(t => t.trim()).filter(Boolean) }
    await fetch(`${BACKEND_URL}/api/questions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    setQForm({ text: '', category: '', difficulty: '', role: '', type: '', expected_answer: '', tags: '' })
    fetchQuestions()
  }

  async function addTemplate(e) {
    e.preventDefault()
    const payload = { ...tForm, question_ids: tForm.question_ids }
    await fetch(`${BACKEND_URL}/api/templates`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    setTForm({ title: '', role: '', seniority: '', description: '', question_ids: [] })
    fetchTemplates()
  }

  async function addInterview(e) {
    e.preventDefault()
    const payload = { ...iForm }
    await fetch(`${BACKEND_URL}/api/interviews`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    setIForm({ candidate_name: '', candidate_email: '', role: '', template_id: '', question_ids: [], scheduled_at: '', mode: '', notes: '' })
    fetchInterviews()
  }

  const questionLookup = useMemo(() => {
    const map = {}
    for (const q of questions) map[q.id] = q
    return map
  }, [questions])

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50">
      <header className="sticky top-0 z-10 bg-white/70 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight text-gray-800">Interview Builder</h1>
          <nav className="space-x-2">
            {['questions','templates','interviews'].map(k => (
              <button key={k} onClick={() => setTab(k)} className={`px-3 py-1.5 rounded-md text-sm font-medium ${tab===k?'bg-blue-600 text-white':'text-gray-700 hover:bg-gray-100'}`}>{k[0].toUpperCase()+k.slice(1)}</button>
            ))}
            <a href="/test" className="ml-2 px-3 py-1.5 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">Health</a>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {tab === 'questions' && (
          <div className="grid md:grid-cols-2 gap-6">
            <Section title="Add Question">
              <form onSubmit={addQuestion} className="space-y-3">
                <Textarea label="Question" value={qForm.text} onChange={e=>setQForm({...qForm,text:e.target.value})} required rows={3} />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Category" value={qForm.category} onChange={e=>setQForm({...qForm,category:e.target.value})} />
                  <Input label="Difficulty" value={qForm.difficulty} onChange={e=>setQForm({...qForm,difficulty:e.target.value})} />
                  <Input label="Role" value={qForm.role} onChange={e=>setQForm({...qForm,role:e.target.value})} />
                  <Input label="Type" value={qForm.type} onChange={e=>setQForm({...qForm,type:e.target.value})} />
                </div>
                <Textarea label="Expected Answer (optional)" value={qForm.expected_answer} onChange={e=>setQForm({...qForm,expected_answer:e.target.value})} rows={3} />
                <Input label="Tags (comma-separated)" value={qForm.tags} onChange={e=>setQForm({...qForm,tags:e.target.value})} />
                <div className="flex justify-end">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">Add</button>
                </div>
              </form>
            </Section>

            <Section title="Questions" actions={<button onClick={fetchQuestions} className="text-sm text-blue-600">Refresh</button>}>
              {qLoading ? <p className="text-gray-500">Loading...</p> : (
                <ul className="space-y-3">
                  {questions.map(q => (
                    <li key={q.id} className="p-3 border border-gray-100 rounded-lg bg-white/70">
                      <p className="font-medium text-gray-800">{q.text}</p>
                      <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-600">
                        {q.category && <Badge>{q.category}</Badge>}
                        {q.difficulty && <Badge>{q.difficulty}</Badge>}
                        {q.role && <Badge>{q.role}</Badge>}
                        {q.type && <Badge>{q.type}</Badge>}
                        {Array.isArray(q.tags) && q.tags.map(t => <Badge key={t}>{t}</Badge>)}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Section>
          </div>
        )}

        {tab === 'templates' && (
          <div className="grid md:grid-cols-2 gap-6">
            <Section title="Create Template">
              <form onSubmit={addTemplate} className="space-y-3">
                <Input label="Title" value={tForm.title} onChange={e=>setTForm({...tForm,title:e.target.value})} required />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Role" value={tForm.role} onChange={e=>setTForm({...tForm,role:e.target.value})} />
                  <Input label="Seniority" value={tForm.seniority} onChange={e=>setTForm({...tForm,seniority:e.target.value})} />
                </div>
                <Textarea label="Description" value={tForm.description} onChange={e=>setTForm({...tForm,description:e.target.value})} rows={3} />
                <div>
                  <span className="text-sm text-gray-600">Add Questions</span>
                  <div className="mt-2 max-h-48 overflow-auto border rounded-md divide-y">
                    {questions.map(q => {
                      const selected = tForm.question_ids.includes(q.id)
                      return (
                        <label key={q.id} className={`flex items-start gap-3 p-2 cursor-pointer ${selected? 'bg-blue-50' : ''}`}>
                          <input type="checkbox" checked={selected} onChange={() => setTForm(s => ({...s, question_ids: selected ? s.question_ids.filter(id=>id!==q.id) : [...s.question_ids, q.id]}))} />
                          <div>
                            <p className="text-sm font-medium text-gray-800">{q.text}</p>
                            <div className="mt-1 flex flex-wrap gap-2">{q.category && <Badge>{q.category}</Badge>} {q.difficulty && <Badge>{q.difficulty}</Badge>}</div>
                          </div>
                        </label>
                      )
                    })}
                  </div>
                </div>
                <div className="flex justify-end">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">Create</button>
                </div>
              </form>
            </Section>

            <Section title="Templates" actions={<button onClick={fetchTemplates} className="text-sm text-blue-600">Refresh</button>}>
              {tLoading ? <p className="text-gray-500">Loading...</p> : (
                <ul className="space-y-3">
                  {templates.map(t => (
                    <li key={t.id} className="p-3 border border-gray-100 rounded-lg bg-white/70">
                      <p className="font-medium text-gray-800">{t.title}</p>
                      <div className="text-xs text-gray-600 mt-1">{t.role} {t.seniority && `• ${t.seniority}`}</div>
                      {Array.isArray(t.question_ids) && t.question_ids.length > 0 && (
                        <div className="mt-2 space-y-1">
                          <p className="text-xs text-gray-600">Questions:</p>
                          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                            {t.question_ids.map(id => (
                              <li key={id}>{questionLookup[id]?.text || id}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Section>
          </div>
        )}

        {tab === 'interviews' && (
          <div className="grid md:grid-cols-2 gap-6">
            <Section title="Schedule Interview">
              <form onSubmit={addInterview} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Candidate Name" value={iForm.candidate_name} onChange={e=>setIForm({...iForm,candidate_name:e.target.value})} required />
                  <Input label="Candidate Email" value={iForm.candidate_email} onChange={e=>setIForm({...iForm,candidate_email:e.target.value})} required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Role" value={iForm.role} onChange={e=>setIForm({...iForm,role:e.target.value})} />
                  <Input label="Mode" value={iForm.mode} onChange={e=>setIForm({...iForm,mode:e.target.value})} />
                </div>
                <Input label="Scheduled At (ISO)" value={iForm.scheduled_at} onChange={e=>setIForm({...iForm,scheduled_at:e.target.value})} placeholder="2025-01-20T15:00:00Z" />
                <div>
                  <span className="text-sm text-gray-600">Use Template (optional)</span>
                  <select value={iForm.template_id} onChange={e=>setIForm({...iForm, template_id: e.target.value})} className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm">
                    <option value="">-- None --</option>
                    {templates.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                  </select>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Add Questions</span>
                  <div className="mt-2 max-h-48 overflow-auto border rounded-md divide-y">
                    {questions.map(q => {
                      const selected = iForm.question_ids.includes(q.id)
                      return (
                        <label key={q.id} className={`flex items-start gap-3 p-2 cursor-pointer ${selected? 'bg-blue-50' : ''}`}>
                          <input type="checkbox" checked={selected} onChange={() => setIForm(s => ({...s, question_ids: selected ? s.question_ids.filter(id=>id!==q.id) : [...s.question_ids, q.id]}))} />
                          <div>
                            <p className="text-sm font-medium text-gray-800">{q.text}</p>
                            <div className="mt-1 flex flex-wrap gap-2">{q.category && <Badge>{q.category}</Badge>} {q.difficulty && <Badge>{q.difficulty}</Badge>}</div>
                          </div>
                        </label>
                      )
                    })}
                  </div>
                </div>
                <Textarea label="Notes" value={iForm.notes} onChange={e=>setIForm({...iForm,notes:e.target.value})} rows={3} />
                <div className="flex justify-end">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">Schedule</button>
                </div>
              </form>
            </Section>

            <Section title="Interviews" actions={<button onClick={fetchInterviews} className="text-sm text-blue-600">Refresh</button>}>
              {iLoading ? <p className="text-gray-500">Loading...</p> : (
                <ul className="space-y-3">
                  {interviews.map(i => (
                    <li key={i.id} className="p-3 border border-gray-100 rounded-lg bg-white/70">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-800">{i.candidate_name} • {i.candidate_email}</p>
                        {i.role && <Badge>{i.role}</Badge>}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {i.mode && <span className="mr-2">{i.mode}</span>}
                        {i.scheduled_at && <span>• {i.scheduled_at}</span>}
                      </div>
                      {Array.isArray(i.question_ids) && i.question_ids.length > 0 && (
                        <div className="mt-2 space-y-1">
                          <p className="text-xs text-gray-600">Questions:</p>
                          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                            {i.question_ids.map(id => (
                              <li key={id}>{questionLookup[id]?.text || id}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Section>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
