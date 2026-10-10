export const Table = ({ headers = [], children }) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 bg-surface text-sm text-left">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header, idx) => (
              <th key={idx} className="px-6 py-3 font-medium text-content-muted">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {children}
        </tbody>
      </table>
    </div>
  );
};