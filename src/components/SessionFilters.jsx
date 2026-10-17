import { STYLES } from '../data'

export default function SessionFilters({
  selectedStyles,
  professorQuery,
  courseFilter = '',
  courseOptions = [],
  onToggleStyle,
  onProfessorQuery,
  onCourseFilter,
  onClear,
}) {
  const hasFilters =
    selectedStyles.length > 0 || professorQuery.trim() !== '' || courseFilter !== ''

  return (
    <div className="filters" aria-label="Session filters">
      <div className="chip-row">
        {STYLES.map((style) => {
          const active = selectedStyles.includes(style)
          return (
            <button
              key={style}
              type="button"
              className={`chip${active ? ' active' : ''}`}
              data-style={style}
              aria-pressed={active}
              onClick={() => onToggleStyle(style)}
            >
              {style}
            </button>
          )
        })}
      </div>
      <div className="filter-fields">
        <label className="filter-field">
          Course
          <select value={courseFilter} onChange={(event) => onCourseFilter(event.target.value)}>
            <option value="">All Courses</option>
            {courseOptions.map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>
        </label>
        <label className="filter-field">
          Professor
          <input
            value={professorQuery}
            onChange={(event) => onProfessorQuery(event.target.value)}
            placeholder="Filter by professor"
          />
        </label>
        {hasFilters ? (
          <button type="button" className="text-link clear-filters" onClick={onClear}>
            Clear Filters
          </button>
        ) : null}
      </div>
    </div>
  )
}
