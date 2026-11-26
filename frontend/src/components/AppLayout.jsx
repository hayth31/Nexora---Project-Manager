import { startTransition, useState } from 'react'
import LogoutIcon from '@mui/icons-material/Logout'
import MenuIcon from '@mui/icons-material/Menu'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Toolbar from '@mui/material/Toolbar'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { APP_NAME } from '../config'
import { useAuth } from '../context/authContext'
import { useNotify } from '../context/notificationContext'
import { useIsMobile } from '../hooks/useIsMobile'
import { NAV_ITEMS } from './navItems'
import StatusChip from './StatusChip'

const DRAWER_WIDTH = 240


/** App shell: top bar + side navigation (permanent on desktop, slide-out drawer on mobile). */
export default function AppLayout() {
  const { user, can, logout } = useAuth()
  const notify = useNotify()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    // React Router runs navigations as transitions; ending the session in the same transition
    // means protected pages never re-render without a session (which would remember this page
    // as the "return to" target for whoever logs in next).
    startTransition(() => {
      logout()
      navigate('/login', { replace: true })
    })
    notify.info('You have been logged out')
  }

  const navigation = (
    <Box component="nav" aria-label="Main navigation" sx={{ py: 1 }}>
      <Toolbar />
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)', mb: 1 }} />
      <List sx={{ px: 0.5 }}>
        {NAV_ITEMS.filter((item) => can(item.permission)).map((item) => (
          // <li> wrapper keeps the <ul> valid for screen readers (axe "list" rule)
          <ListItem key={item.to} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              component={NavLink}
              to={item.to}
              end={item.end}
              onClick={() => setMenuOpen(false)}
              sx={{
                mx: 1,
                borderRadius: 2,
                color: '#cbd5e1',
                transition: 'all 150ms ease',
                '& .MuiListItemIcon-root': { color: '#94a3b8', transition: 'color 150ms ease' },
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.07)', color: '#ffffff', '& .MuiListItemIcon-root': { color: '#e2e8f0' } },
                '&.active': {
                  background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.36) 0%, rgba(124, 58, 237, 0.22) 100%)',
                  color: '#ffffff',
                  boxShadow: 'inset 3px 0 0 #818cf8',
                  '& .MuiListItemIcon-root': { color: '#a5b4fc' },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} slotProps={{ primary: { fontWeight: 500, fontSize: '0.925rem' } }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  )

  const drawerPaperSx = {
    width: DRAWER_WIDTH,
    boxSizing: 'border-box',
    background: 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)',
    color: '#f8fafc',
    borderRight: 'none',
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Link
        href="#main-content"
        onClick={(event) => {
          event.preventDefault()
          document.getElementById('main-content')?.focus()
        }}
        sx={{ position: 'absolute', left: -9999, '&:focus': { left: 16, top: 16, zIndex: 2000, bgcolor: 'background.paper', p: 1 } }}
      >
        Skip to main content
      </Link>
      <AppBar
        position="fixed"
        color="inherit"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton edge="start" aria-label="Open navigation menu" onClick={() => setMenuOpen(true)} sx={{ mr: 1 }}>
              <MenuIcon />
            </IconButton>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexGrow: 1 }}>
            <Box
              aria-hidden="true"
              sx={{
                width: 30,
                height: 30,
                borderRadius: 1.75,
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                color: '#ffffff',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 800,
                fontSize: '0.95rem',
                boxShadow: '0 2px 8px rgba(79, 70, 229, 0.35)',
              }}
            >
              N
            </Box>
            <Typography
              variant="h6"
              component="div"
              noWrap
              sx={{
                fontWeight: 800,
                letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, #3730a3 0%, #6d28d9 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {APP_NAME}
            </Typography>
          </Box>
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {!isMobile && (
                <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500 }}>
                  {user.full_name}
                </Typography>
              )}
              <StatusChip kind="role" value={user.role} />
              <Tooltip title="Log out">
                <IconButton aria-label="Log out" onClick={handleLogout}>
                  <LogoutIcon />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {isMobile ? (
        <Drawer variant="temporary" open={menuOpen} onClose={() => setMenuOpen(false)} slotProps={{ paper: { sx: drawerPaperSx } }}>
          {navigation}
        </Drawer>
      ) : (
        <Drawer variant="permanent" sx={{ width: DRAWER_WIDTH, flexShrink: 0 }} slotProps={{ paper: { sx: drawerPaperSx } }}>
          {navigation}
        </Drawer>
      )}

      <Box
        component="main"
        id="main-content"
        tabIndex={-1}
        sx={{ flexGrow: 1, minWidth: 0, p: { xs: 2, md: 3 }, outline: 'none', width: { md: `calc(100% - ${DRAWER_WIDTH}px)` } }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  )
}
