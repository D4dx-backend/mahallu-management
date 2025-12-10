import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useThemeStore } from './store/themeStore';
import { applyTheme } from './utils/theme';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/ui/ProtectedRoute';
import Login from './features/auth/pages/Login';
import Dashboard from './features/dashboard/pages/Dashboard';
import MahallUsersList from './features/users/pages/MahallUsersList';
import CreateMahallUser from './features/users/pages/CreateMahallUser';
import EditMahallUser from './features/users/pages/EditMahallUser';
import UserDetail from './features/users/pages/UserDetail';
import FamiliesList from './features/families/pages/FamiliesList';
import CreateFamily from './features/families/pages/CreateFamily';
import EditFamily from './features/families/pages/EditFamily';
import FamilyDetail from './features/families/pages/FamilyDetail';
import MembersList from './features/members/pages/MembersList';
import CreateMember from './features/members/pages/CreateMember';
import EditMember from './features/members/pages/EditMember';
import MemberDetail from './features/members/pages/MemberDetail';
import InstitutesList from './features/institutes/pages/InstitutesList';
import CreateInstitute from './features/institutes/pages/CreateInstitute';
import EditInstitute from './features/institutes/pages/EditInstitute';
import ProgramsList from './features/programs/pages/ProgramsList';
import CreateProgram from './features/programs/pages/CreateProgram';
import EditProgram from './features/programs/pages/EditProgram';
import ProgramDetail from './features/programs/pages/ProgramDetail';
import MadrasaList from './features/madrasa/pages/MadrasaList';
import CreateMadrasa from './features/madrasa/pages/CreateMadrasa';
import EditMadrasa from './features/madrasa/pages/EditMadrasa';
import MadrasaDetail from './features/madrasa/pages/MadrasaDetail';
import CommitteesList from './features/committees/pages/CommitteesList';
import CreateCommittee from './features/committees/pages/CreateCommittee';
import CommitteeDetail from './features/committees/pages/CommitteeDetail';
import EditCommittee from './features/committees/pages/EditCommittee';
import MeetingsList from './features/committees/pages/MeetingsList';
import NikahRegistrationsList from './features/registrations/pages/NikahRegistrationsList';
import NikahRegistrationDetail from './features/registrations/pages/NikahRegistrationDetail';
import CreateNikahRegistration from './features/registrations/pages/CreateNikahRegistration';
import DeathRegistrationsList from './features/registrations/pages/DeathRegistrationsList';
import DeathRegistrationDetail from './features/registrations/pages/DeathRegistrationDetail';
import CreateDeathRegistration from './features/registrations/pages/CreateDeathRegistration';
import NOCList from './features/registrations/pages/NOCList';
import NOCDetail from './features/registrations/pages/NOCDetail';
import CreateNOC from './features/registrations/pages/CreateNOC';
import EditNOC from './features/registrations/pages/EditNOC';
import CollectionsOverview from './features/collectibles/pages/CollectionsOverview';
import VarisangyaList from './features/collectibles/pages/VarisangyaList';
import CreateVarisangya from './features/collectibles/pages/CreateVarisangya';
import FamilyVarisangyaList from './features/collectibles/pages/FamilyVarisangyaList';
import FamilyVarisangyaTransactions from './features/collectibles/pages/FamilyVarisangyaTransactions';
import FamilyVarisangyaWallet from './features/collectibles/pages/FamilyVarisangyaWallet';
import MemberVarisangyaList from './features/collectibles/pages/MemberVarisangyaList';
import MemberVarisangyaTransactions from './features/collectibles/pages/MemberVarisangyaTransactions';
import MemberVarisangyaWallet from './features/collectibles/pages/MemberVarisangyaWallet';
import ZakatList from './features/collectibles/pages/ZakatList';
import CreateZakat from './features/collectibles/pages/CreateZakat';
import AreaReport from './features/reports/pages/AreaReport';
import BloodBankReport from './features/reports/pages/BloodBankReport';
import OrphansReport from './features/reports/pages/OrphansReport';
import BannersList from './features/social/pages/BannersList';
import FeedsList from './features/social/pages/FeedsList';
import ActivityLogsList from './features/social/pages/ActivityLogsList';
import SupportList from './features/social/pages/SupportList';
import InstituteAccountsList from './features/master-accounts/pages/InstituteAccountsList';
import CreateInstituteAccount from './features/master-accounts/pages/CreateInstituteAccount';
import CategoriesList from './features/master-accounts/pages/CategoriesList';
import CreateCategory from './features/master-accounts/pages/CreateCategory';
import WalletsList from './features/master-accounts/pages/WalletsList';
import CreateWallet from './features/master-accounts/pages/CreateWallet';
import LedgersList from './features/master-accounts/pages/LedgersList';
import CreateLedger from './features/master-accounts/pages/CreateLedger';
import LedgerItemsList from './features/master-accounts/pages/LedgerItemsList';
import CreateLedgerItem from './features/master-accounts/pages/CreateLedgerItem';
import SurveyUsersList from './features/users/pages/SurveyUsersList';
import CreateSurveyUser from './features/users/pages/CreateSurveyUser';
import EditSurveyUser from './features/users/pages/EditSurveyUser';
import InstituteUsersList from './features/users/pages/InstituteUsersList';
import CreateInstituteUser from './features/users/pages/CreateInstituteUser';
import EditInstituteUser from './features/users/pages/EditInstituteUser';
import AllUsersList from './features/users/pages/AllUsersList';
import SelectUserType from './features/users/pages/SelectUserType';
import UnapprovedFamiliesList from './features/families/pages/UnapprovedFamiliesList';
import InstituteDetail from './features/institutes/pages/InstituteDetail';
import NotificationsList from './features/notifications/pages/NotificationsList';
import TenantsList from './features/admin/pages/TenantsList';
import CreateTenant from './features/admin/pages/CreateTenant';
import MahallMain from './features/admin/pages/MahallMain';
import { ROUTES } from './constants/routes';

function App() {
  const { theme } = useThemeStore();

  useEffect(() => {
    applyTheme();
  }, [theme]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Navigate to="/dashboard" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        {/* Admin Routes (Super Admin Only) */}
        <Route
          path="/admin/tenants"
          element={
            <ProtectedRoute superAdminOnly>
              <MainLayout>
                <TenantsList />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/tenants/create"
          element={
            <ProtectedRoute superAdminOnly>
              <MainLayout>
                <CreateTenant />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        {/* Mahall Main Route */}
        <Route
          path={ROUTES.MAHALL_MAIN}
          element={
            <ProtectedRoute>
              <MainLayout>
                <MahallMain />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        {/* Users Routes */}
        <Route
          path={ROUTES.USERS.MAHALL}
          element={
            <ProtectedRoute>
              <MainLayout>
                <MahallUsersList />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.USERS.CREATE_MAHALL}
          element={
            <ProtectedRoute>
              <MainLayout>
                <CreateMahallUser />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/mahall/:id/edit"
          element={
            <ProtectedRoute>
              <MainLayout>
                <EditMahallUser />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/mahall/:id"
          element={
            <ProtectedRoute>
              <MainLayout>
                <UserDetail />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        {/* Families Routes */}
        <Route
          path={ROUTES.FAMILIES.LIST}
          element={
            <ProtectedRoute>
              <MainLayout>
                <FamiliesList />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.FAMILIES.CREATE}
          element={
            <ProtectedRoute>
              <MainLayout>
                <CreateFamily />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/families/:id/edit"
          element={
            <ProtectedRoute>
              <MainLayout>
                <EditFamily />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.FAMILIES.DETAIL(':id')}
          element={
            <ProtectedRoute>
              <MainLayout>
                <FamilyDetail />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        {/* Members Routes */}
        <Route
          path={ROUTES.MEMBERS.LIST}
          element={
            <ProtectedRoute>
              <MainLayout>
                <MembersList />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.MEMBERS.CREATE}
          element={
            <ProtectedRoute>
              <MainLayout>
                <CreateMember />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/members/:id/edit"
          element={
            <ProtectedRoute>
              <MainLayout>
                <EditMember />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.MEMBERS.DETAIL(':id')}
          element={
            <ProtectedRoute>
              <MainLayout>
                <MemberDetail />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        {/* Institutes Routes */}
        <Route
          path={ROUTES.INSTITUTES.LIST}
          element={
            <ProtectedRoute>
              <MainLayout>
                <InstitutesList />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.INSTITUTES.CREATE}
          element={
            <ProtectedRoute>
              <MainLayout>
                <CreateInstitute />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.INSTITUTES.DETAIL(':id')}
          element={
            <ProtectedRoute>
              <MainLayout>
                <InstituteDetail />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/institutes/:id/edit"
          element={
            <ProtectedRoute>
              <MainLayout>
                <EditInstitute />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        {/* Programs Routes */}
        <Route
          path={ROUTES.PROGRAMS.LIST}
          element={
            <ProtectedRoute>
              <MainLayout>
                <ProgramsList />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.PROGRAMS.CREATE}
          element={
            <ProtectedRoute>
              <MainLayout>
                <CreateProgram />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.PROGRAMS.DETAIL(':id')}
          element={
            <ProtectedRoute>
              <MainLayout>
                <ProgramDetail />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/programs/:id/edit"
          element={
            <ProtectedRoute>
              <MainLayout>
                <EditProgram />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        {/* Madrasa Routes */}
        <Route
          path={ROUTES.MADRASA.LIST}
          element={
            <ProtectedRoute>
              <MainLayout>
                <MadrasaList />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.MADRASA.CREATE}
          element={
            <ProtectedRoute>
              <MainLayout>
                <CreateMadrasa />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.MADRASA.DETAIL(':id')}
          element={
            <ProtectedRoute>
              <MainLayout>
                <MadrasaDetail />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/madrasa/:id/edit"
          element={
            <ProtectedRoute>
              <MainLayout>
                <EditMadrasa />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        {/* Committees Routes */}
        <Route
          path={ROUTES.COMMITTEES.LIST}
          element={
            <ProtectedRoute>
              <MainLayout>
                <CommitteesList />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/committees/create"
          element={
            <ProtectedRoute>
              <MainLayout>
                <CreateCommittee />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.COMMITTEES.DETAIL(':id')}
          element={
            <ProtectedRoute>
              <MainLayout>
                <CommitteeDetail />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/committees/:id/edit"
          element={
            <ProtectedRoute>
              <MainLayout>
                <EditCommittee />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/committees/:id/meetings"
          element={
            <ProtectedRoute>
              <MainLayout>
                <MeetingsList />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.COMMITTEES.MEETINGS}
          element={
            <ProtectedRoute>
              <MainLayout>
                <MeetingsList />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        {/* Registrations Routes */}
        <Route
          path={ROUTES.REGISTRATIONS.NIKAH}
          element={
            <ProtectedRoute>
              <MainLayout>
                <NikahRegistrationsList />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/registrations/nikah/:id"
          element={
            <ProtectedRoute>
              <MainLayout>
                <NikahRegistrationDetail />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/registrations/nikah/create"
          element={
            <ProtectedRoute>
              <MainLayout>
                <CreateNikahRegistration />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.REGISTRATIONS.DEATH}
          element={
            <ProtectedRoute>
              <MainLayout>
                <DeathRegistrationsList />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/registrations/death/:id"
          element={
            <ProtectedRoute>
              <MainLayout>
                <DeathRegistrationDetail />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/registrations/death/create"
          element={
            <ProtectedRoute>
              <MainLayout>
                <CreateDeathRegistration />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.REGISTRATIONS.NOC.COMMON}
          element={
            <ProtectedRoute>
              <MainLayout>
                <NOCList />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.REGISTRATIONS.NOC.NIKAH}
          element={
            <ProtectedRoute>
              <MainLayout>
                <NOCList />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/registrations/noc/create"
          element={
            <ProtectedRoute>
              <MainLayout>
                <CreateNOC />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/registrations/noc/:id"
          element={
            <ProtectedRoute>
              <MainLayout>
                <NOCDetail />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/registrations/noc/:id/edit"
          element={
            <ProtectedRoute>
              <MainLayout>
                <EditNOC />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        {/* Collectibles Routes */}
        <Route
          path="/collections"
          element={
            <ProtectedRoute>
              <MainLayout>
                <CollectionsOverview />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.COLLECTIBLES.VARISANGYA}
          element={
            <ProtectedRoute>
              <MainLayout>
                <VarisangyaList />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/collectibles/varisangya/create"
          element={
            <ProtectedRoute>
              <MainLayout>
                <CreateVarisangya />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.COLLECTIBLES.ZAKAT}
          element={
            <ProtectedRoute>
              <MainLayout>
                <ZakatList />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/collectibles/zakat/create"
          element={
            <ProtectedRoute>
              <MainLayout>
                <CreateZakat />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.COLLECTIBLES.FAMILY_VARISANGYA.LIST}
          element={
            <ProtectedRoute>
              <MainLayout>
                <FamilyVarisangyaList />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.COLLECTIBLES.FAMILY_VARISANGYA.TRANSACTIONS}
          element={
            <ProtectedRoute>
              <MainLayout>
                <FamilyVarisangyaTransactions />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.COLLECTIBLES.FAMILY_VARISANGYA.WALLET}
          element={
            <ProtectedRoute>
              <MainLayout>
                <FamilyVarisangyaWallet />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.COLLECTIBLES.MEMBER_VARISANGYA.LIST}
          element={
            <ProtectedRoute>
              <MainLayout>
                <MemberVarisangyaList />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.COLLECTIBLES.MEMBER_VARISANGYA.TRANSACTIONS}
          element={
            <ProtectedRoute>
              <MainLayout>
                <MemberVarisangyaTransactions />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.COLLECTIBLES.MEMBER_VARISANGYA.WALLET}
          element={
            <ProtectedRoute>
              <MainLayout>
                <MemberVarisangyaWallet />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        {/* Reports Routes */}
        <Route
          path={ROUTES.REPORTS.AREA}
          element={
            <ProtectedRoute>
              <MainLayout>
                <AreaReport />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.REPORTS.BLOOD_BANK}
          element={
            <ProtectedRoute>
              <MainLayout>
                <BloodBankReport />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.REPORTS.ORPHANS}
          element={
            <ProtectedRoute>
              <MainLayout>
                <OrphansReport />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        {/* Social Routes */}
        <Route
          path={ROUTES.SOCIAL.BANNERS}
          element={
            <ProtectedRoute>
              <MainLayout>
                <BannersList />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.SOCIAL.FEEDS}
          element={
            <ProtectedRoute>
              <MainLayout>
                <FeedsList />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.SOCIAL.SUPER_FEEDS}
          element={
            <ProtectedRoute>
              <MainLayout>
                <FeedsList />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.SOCIAL.ACTIVITY_LOGS}
          element={
            <ProtectedRoute>
              <MainLayout>
                <ActivityLogsList />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.SOCIAL.SUPPORT}
          element={
            <ProtectedRoute>
              <MainLayout>
                <SupportList />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        {/* Master Accounts Routes */}
        <Route
          path={ROUTES.MASTER_ACCOUNTS.INSTITUTE_ACCOUNTS}
          element={
            <ProtectedRoute>
              <MainLayout>
                <InstituteAccountsList />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/master-accounts/institute/create"
          element={
            <ProtectedRoute>
              <MainLayout>
                <CreateInstituteAccount />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.MASTER_ACCOUNTS.CATEGORIES}
          element={
            <ProtectedRoute>
              <MainLayout>
                <CategoriesList />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/master-accounts/categories/create"
          element={
            <ProtectedRoute>
              <MainLayout>
                <CreateCategory />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.MASTER_ACCOUNTS.WALLETS}
          element={
            <ProtectedRoute>
              <MainLayout>
                <WalletsList />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/master-accounts/wallets/create"
          element={
            <ProtectedRoute>
              <MainLayout>
                <CreateWallet />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.MASTER_ACCOUNTS.LEDGERS}
          element={
            <ProtectedRoute>
              <MainLayout>
                <LedgersList />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/master-accounts/ledgers/create"
          element={
            <ProtectedRoute>
              <MainLayout>
                <CreateLedger />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.MASTER_ACCOUNTS.LEDGER_ITEMS}
          element={
            <ProtectedRoute>
              <MainLayout>
                <LedgerItemsList />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/master-accounts/ledger-items/create"
          element={
            <ProtectedRoute>
              <MainLayout>
                <CreateLedgerItem />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        {/* Additional User Routes */}
        <Route
          path={ROUTES.USERS.SURVEY}
          element={
            <ProtectedRoute>
              <MainLayout>
                <SurveyUsersList />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/survey/create"
          element={
            <ProtectedRoute>
              <MainLayout>
                <CreateSurveyUser />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/survey/:id/edit"
          element={
            <ProtectedRoute>
              <MainLayout>
                <EditSurveyUser />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/survey/:id"
          element={
            <ProtectedRoute>
              <MainLayout>
                <UserDetail />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.USERS.INSTITUTE}
          element={
            <ProtectedRoute>
              <MainLayout>
                <InstituteUsersList />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/institute/create"
          element={
            <ProtectedRoute>
              <MainLayout>
                <CreateInstituteUser />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/institute/:id/edit"
          element={
            <ProtectedRoute>
              <MainLayout>
                <EditInstituteUser />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/institute/:id"
          element={
            <ProtectedRoute>
              <MainLayout>
                <UserDetail />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute superAdminOnly>
              <MainLayout>
                <AllUsersList />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users/create"
          element={
            <ProtectedRoute superAdminOnly>
              <MainLayout>
                <SelectUserType />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users/:id"
          element={
            <ProtectedRoute superAdminOnly>
              <MainLayout>
                <UserDetail />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users/:id/edit"
          element={
            <ProtectedRoute superAdminOnly>
              <MainLayout>
                <EditMahallUser />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        {/* Additional Family Routes */}
        <Route
          path={ROUTES.FAMILIES.UNAPPROVED}
          element={
            <ProtectedRoute>
              <MainLayout>
                <UnapprovedFamiliesList />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        {/* Notifications Routes */}
        <Route
          path={ROUTES.NOTIFICATIONS.INDIVIDUAL}
          element={
            <ProtectedRoute>
              <MainLayout>
                <NotificationsList />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.NOTIFICATIONS.COLLECTION}
          element={
            <ProtectedRoute>
              <MainLayout>
                <NotificationsList />
              </MainLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
