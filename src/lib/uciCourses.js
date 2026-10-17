// UCI course catalog from Anteater API (https://anteaterapi.com, by ICSSC).
// Used to suggest real courses as students type and to check that a class
// exists before it's added. No API key needed (about 1,000 requests per
// hour per visitor). Results are cached for the browser session.
const API = 'https://anteaterapi.com/v2/rest'
const GRAPHQL = 'https://anteaterapi.com/v2/graphql'

// Everyday names for departments -> UCI's official codes.
const ALIASES = {
  ICS: 'I&C SCI',
  ICSCI: 'I&C SCI',
  CS: 'COMPSCI',
  COMPSCI: 'COMPSCI',
  INF: 'IN4MATX',
  INFX: 'IN4MATX',
  INFORMATICS: 'IN4MATX',
  BIO: 'BIO SCI',
  BIOLOGY: 'BIO SCI',
  STAT: 'STATS',
  STATISTICS: 'STATS',
  PHYS: 'PHYSICS',
  CHEMISTRY: 'CHEM',
  ECONOMICS: 'ECON',
  PSYCHOLOGY: 'PSYCH',
  WRITE: 'WRITING',
  PHIL: 'PHILOS',
  PHILOSOPHY: 'PHILOS',
  HIST: 'HISTORY',
  SOCIOLOGY: 'SOCIOL',
  LING: 'LINGUIS',
  POLISCI: 'POL SCI',
  MGT: 'MGMT',
}

const squash = (text) => String(text || '').toUpperCase().replace(/[^A-Z0-9]/g, '')
const tidy = (text) => String(text || '').toUpperCase().trim().replace(/\s+/g, ' ')

// Split "math 2b" into { dept: 'MATH', num: '2B' }.
function splitCourse(text) {
  const value = tidy(text)
  if (!value) return { dept: '', num: '' }
  const lastSpace = value.lastIndexOf(' ')
  if (lastSpace > 0 && /^[A-Z]?\d/.test(value.slice(lastSpace + 1))) {
    return { dept: value.slice(0, lastSpace), num: value.slice(lastSpace + 1) }
  }
  const glued = value.match(/^([A-Z&/ ]+?)(\d[0-9A-Z]*)$/)
  if (glued) return { dept: glued[1].trim(), num: glued[2] }
  return { dept: value, num: '' }
}

// Offline version used for matching: "ics 31" -> "I&C SCI 31".
export function canonicalCourse(text) {
  const { dept, num } = splitCourse(text)
  if (!dept) return ''
  const official = ALIASES[squash(dept)] || dept
  return num ? `${official} ${num}` : official
}

const memory = new Map()

function cached(key, load) {
  if (memory.has(key)) return memory.get(key)
  try {
    const saved = window.sessionStorage.getItem(key)
    if (saved) {
      const value = Promise.resolve(JSON.parse(saved))
      memory.set(key, value)
      return value
    }
  } catch {
    // Storage blocked: just use memory.
  }
  const promise = load().then((value) => {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Too big or blocked: memory cache is enough.
    }
    return value
  })
  memory.set(key, promise)
  promise.catch(() => memory.delete(key))
  return promise
}

async function getJson(path) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 10000)
  try {
    const response = await fetch(`${API}${path}`, { signal: controller.signal })
    const body = await response.json().catch(() => null)
    if (response.status === 404) return null
    if (!response.ok || !body?.ok) throw new Error(body?.message || `Anteater API error ${response.status}`)
    return body.data
  } finally {
    clearTimeout(timer)
  }
}

// All departments: [{ code: 'MATH', name: 'Mathematics' }, ...]
export function getDepartments() {
  return cached('uci-departments', async () => {
    const data = await getJson('/websoc/departments')
    return (data || []).map((dept) => ({ code: dept.deptCode, name: dept.deptName }))
  })
}

function findDepartment(text, departments) {
  const key = squash(text)
  if (!key) return null
  const target = squash(ALIASES[key] || text)
  return departments.find((dept) => squash(dept.code) === target) || null
}

const byNumber = (a, b) => a.numeric - b.numeric || a.number.localeCompare(b.number)

// GraphQL lets us ask for just the fields we need (about 20x smaller than REST).
async function getDepartmentPageGraphql(deptCode, skip) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 10000)
  try {
    const response = await fetch(GRAPHQL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        query:
          'query ($department: String!, $skip: Int!) { courses(query: { department: $department, take: 100, skip: $skip }) { department courseNumber courseNumeric title } }',
        variables: { department: deptCode, skip },
      }),
    })
    const body = await response.json()
    if (!response.ok || body.errors?.length || !body.data) throw new Error('Anteater API GraphQL error')
    return body.data.courses || []
  } finally {
    clearTimeout(timer)
  }
}

// Every course in one department (slimmed down): [{ code, number, title }]
export function getDepartmentCourses(deptCode) {
  return cached(`uci-courses:${deptCode}`, async () => {
    const courses = []
    try {
      // Load 3 pages at once (covers almost every department), then any extra.
      let page = 0
      let more = true
      while (more && page < 9) {
        const batch = await Promise.all([0, 1, 2].map((i) => getDepartmentPageGraphql(deptCode, (page + i) * 100)))
        batch.flat().forEach((course) =>
          courses.push({
            code: `${course.department} ${course.courseNumber}`,
            number: course.courseNumber,
            numeric: course.courseNumeric ?? 0,
            title: course.title,
          }),
        )
        more = batch[2].length === 100
        page += 3
      }
      return courses.sort(byNumber)
    } catch {
      courses.length = 0 // GraphQL unavailable: fall back to the REST API below.
    }
    for (let page = 0; page < 8; page += 1) {
      const data = await getJson(
        `/courses?department=${encodeURIComponent(deptCode)}&take=100&skip=${page * 100}`,
      )
      const list = data || []
      list.forEach((course) =>
        courses.push({
          code: `${course.department} ${course.courseNumber}`,
          number: course.courseNumber,
          numeric: course.courseNumeric ?? 0,
          title: course.title,
        }),
      )
      if (list.length < 100) break
    }
    return courses.sort(byNumber)
  })
}

// Suggestions for what's typed so far. Either departments ("ma" ->
// MATH, MAE…) or courses ("math 2" -> MATH 2A, MATH 2B…).
export async function suggestCourses(text, limit = 8) {
  const { dept, num } = splitCourse(text)
  if (!dept) return []
  const departments = await getDepartments()
  const match = findDepartment(dept, departments)
  if (!match) {
    const key = squash(dept)
    const words = tidy(dept).toLowerCase()
    // Codes that start with what's typed first, then names that do, then the rest.
    const rank = (d) =>
      squash(d.code).startsWith(key) ? 0 : d.name.toLowerCase().startsWith(words) ? 1 : 2
    return departments
      .filter((d) => squash(d.code).startsWith(key) || d.name.toLowerCase().includes(words))
      .sort((a, b) => rank(a) - rank(b) || a.code.localeCompare(b.code))
      .slice(0, 6)
      .map((d) => ({ type: 'dept', code: d.code, title: d.name }))
  }
  const courses = await getDepartmentCourses(match.code)
  return courses
    .filter((course) => !num || course.number.startsWith(num))
    .slice(0, limit)
    .map((course) => ({ type: 'course', code: course.code, title: course.title }))
}

// The official course for what was typed, or null if UCI has no such course.
// Throws if the course list can't be reached.
export async function findCourse(text) {
  const { dept, num } = splitCourse(text)
  if (!dept || !num) return null
  const departments = await getDepartments()
  const match = findDepartment(dept, departments)
  if (!match) return null
  const data = await getJson(
    `/courses?department=${encodeURIComponent(match.code)}&courseNumber=${encodeURIComponent(num)}`,
  )
  const course = (data || []).find((item) => item.courseNumber === num)
  return course ? { type: 'course', code: `${course.department} ${course.courseNumber}`, title: course.title } : null
}
