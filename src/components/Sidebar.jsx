import {
  HomeIcon,
  BuddiesIcon,
  SessionsIcon,
  ProfileIcon,
  SettingsIcon,
  LogoutIcon,
} from './Icons'
import { BrandPeekers } from './Illustrations'

const NAV = [
  { id: 'home', label: 'Home', icon: HomeIcon },
  { id: 'buddies', label: 'Find Study Buddies', icon: BuddiesIcon },
  { id: 'sessions', label: 'Study Sessions', icon: SessionsIcon },
  { id: 'profile', label: 'My Profile', icon: ProfileIcon },
]

export default function Sidebar({ currentPage, onNavigate, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-word">
          <BrandPeekers />
          <span className="brand-zot">Zot</span>
          <span className="brand-study">Study</span>
        </span>
        <span className="brand-tag">Anteater study hub</span>
      </div>
      <nav className="sidebar-nav">
        {NAV.map((item) => {
          const Icon = item.icon
          const active = currentPage === item.id || (item.id === 'sessions' && currentPage === 'create')
          return (
            <button
              key={item.id}
              type="button"
              className={`nav-item${active ? ' active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <Icon />
              {item.label}
            </button>
          )
        })}
      </nav>
      <div className="sidebar-spacer" />
      <div className="sidebar-footer">
        <button
          type="button"
          className={`nav-item${currentPage === 'settings' ? ' active' : ''}`}
          onClick={() => onNavigate('settings')}
        >
          <SettingsIcon />
          Settings
        </button>
        <button type="button" className="nav-item" onClick={onLogout}>
          <LogoutIcon />
          Log Out
        </button>
      </div>
    </aside>
  )
}
