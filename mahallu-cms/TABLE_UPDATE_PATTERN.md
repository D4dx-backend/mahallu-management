# Table Header Style Update Pattern

## Changes Required for Each List Page

### 1. Add Imports
```typescript
import TableToolbar from '@/components/ui/TableToolbar';
import { FiX } from 'react-icons/fi';
import { exportToCSV, exportToJSON, exportToPDF } from '@/utils/exportUtils';
```

### 2. Remove Import
```typescript
// Remove: import SearchInput from '@/components/ui/SearchInput';
```

### 3. Add State
```typescript
const [isFilterVisible, setIsFilterVisible] = useState(false);
const [isExporting, setIsExporting] = useState(false);
```

### 4. Add Export Handler
```typescript
const handleExport = async (type: 'csv' | 'json' | 'pdf') => {
  try {
    setIsExporting(true);
    
    const params: any = { limit: 10000 };
    if (debouncedSearch) params.search = debouncedSearch;
    // Add any other filters here
    
    const result = await SERVICE.getAll(params);
    const dataToExport = result.data;

    if (dataToExport.length === 0) {
      alert('No data to export');
      return;
    }

    const filename = 'ENTITY_NAME';
    const title = 'ENTITY_TITLE';

    switch (type) {
      case 'csv':
        exportToCSV(columns, dataToExport, filename);
        break;
      case 'json':
        exportToJSON(columns, dataToExport, filename);
        break;
      case 'pdf':
        exportToPDF(columns, dataToExport, filename, title);
        break;
    }
  } catch (error: any) {
    console.error('Export error:', error);
    alert(error?.message || 'Failed to export data');
  } finally {
    setIsExporting(false);
  }
};
```

### 5. Replace SearchInput Section with TableToolbar
```typescript
// BEFORE:
<div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
  <div className="flex-1 max-w-md">
    <SearchInput
      placeholder="Search..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      onClear={() => setSearchQuery('')}
    />
  </div>
  <div className="flex gap-2">
    {/* Action buttons */}
  </div>
</div>

// AFTER:
<TableToolbar
  searchQuery={searchQuery}
  onSearchChange={setSearchQuery}
  onFilterClick={() => setIsFilterVisible(!isFilterVisible)}
  isFilterVisible={isFilterVisible}
  onRefresh={fetchData}
  onExport={handleExport}
  isExporting={isExporting}
  actionButtons={
    <>
      {/* Move action buttons here */}
    </>
  }
/>
```

### 6. Add Filter Panel (if filters exist)
```typescript
{isFilterVisible && (
  <div className="relative flex flex-wrap items-center gap-4 mb-6 p-4 border border-gray-200 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700">
    <button
      onClick={() => setIsFilterVisible(false)}
      className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
    >
      <FiX className="h-4 w-4" />
    </button>
    {/* Wrap each Select in a width-constrained div */}
    <div className="w-40">
      <Select ... />
    </div>
  </div>
)}
```

### 7. Update Table Component
```typescript
<Table
  columns={columns}
  data={items}
  emptyMessage="No items found"
  showExport={false}  // Add this line
/>
```

## Files Updated
✅ AllUsersList.tsx
✅ MembersList.tsx
✅ InstitutesList.tsx
✅ FamiliesList.tsx
✅ MadrasaList.tsx
✅ CommitteesList.tsx

## Files Remaining (Apply same pattern)
- [ ] ProgramsList.tsx
- [ ] MeetingsList.tsx
- [ ] ZakatList.tsx
- [ ] NOCList.tsx
- [ ] DeathRegistrationsList.tsx
- [ ] NikahRegistrationsList.tsx
- [ ] FeedsList.tsx
- [ ] BannersList.tsx
- [ ] SupportList.tsx
- [ ] ActivityLogsList.tsx
- [ ] TenantsList.tsx
- [ ] MahallUsersList.tsx
- [ ] SurveyUsersList.tsx
- [ ] InstituteUsersList.tsx
- [ ] UnapprovedFamiliesList.tsx
- [ ] LedgerItemsList.tsx
- [ ] LedgersList.tsx
- [ ] CategoriesList.tsx
- [ ] InstituteAccountsList.tsx
- [ ] WalletsList.tsx
- [ ] VarisangyaList.tsx
- [ ] MemberVarisangyaList.tsx
- [ ] MemberVarisangyaWallet.tsx
- [ ] MemberVarisangyaTransactions.tsx
- [ ] FamilyVarisangyaList.tsx
- [ ] FamilyVarisangyaWallet.tsx
- [ ] FamilyVarisangyaTransactions.tsx

