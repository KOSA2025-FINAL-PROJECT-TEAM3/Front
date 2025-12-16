import { ROUTE_PATHS } from '@config/routes.config'
import { USER_ROLES } from '@config/constants'
import HomeRoundedIcon from '@mui/icons-material/HomeRounded'
import LocalPharmacyRoundedIcon from '@mui/icons-material/LocalPharmacyRounded'
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded'

export const getPrimaryNavItems = ({ roleKey }) => {
  if (roleKey === USER_ROLES.CAREGIVER) {
    return [
      { path: ROUTE_PATHS.caregiverDashboard, label: '홈', icon: <HomeRoundedIcon /> },
      { path: ROUTE_PATHS.medication, label: '약', icon: <LocalPharmacyRoundedIcon /> },
      { path: ROUTE_PATHS.family, label: '가족', icon: <PeopleRoundedIcon /> },
    ]
  }

  return [
    { path: ROUTE_PATHS.seniorDashboard, label: '홈', icon: <HomeRoundedIcon /> },
    { path: ROUTE_PATHS.medication, label: '약', icon: <LocalPharmacyRoundedIcon /> },
    { path: ROUTE_PATHS.family, label: '가족', icon: <PeopleRoundedIcon /> },
  ]
}
