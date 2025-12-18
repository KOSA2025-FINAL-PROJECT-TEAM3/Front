import { ROUTE_PATHS } from '@config/routes.config'
import { USER_ROLES } from '@config/constants'
import HomeRoundedIcon from '@mui/icons-material/HomeRounded'
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded'
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded'
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded'

export const getPrimaryNavItems = ({ roleKey }) => {
  if (roleKey === USER_ROLES.CAREGIVER) {
    return [
      { path: ROUTE_PATHS.caregiverDashboard, label: '홈', icon: <HomeRoundedIcon /> },
      { path: ROUTE_PATHS.family, label: '가족', icon: <PeopleRoundedIcon /> },
      { path: ROUTE_PATHS.notifications, label: '알림', icon: <NotificationsRoundedIcon /> },
      { path: ROUTE_PATHS.more, label: '더보기', icon: <MoreHorizRoundedIcon /> },
    ]
  }

  return [
    { path: ROUTE_PATHS.seniorDashboard, label: '홈', icon: <HomeRoundedIcon /> },
    { path: ROUTE_PATHS.family, label: '가족', icon: <PeopleRoundedIcon /> },
    { path: ROUTE_PATHS.notifications, label: '알림', icon: <NotificationsRoundedIcon /> },
    { path: ROUTE_PATHS.more, label: '더보기', icon: <MoreHorizRoundedIcon /> },
  ]
}
