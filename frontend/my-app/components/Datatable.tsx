'use client'

interface DatatableProps<T extends Record<string, any>> {
  data: T[]
  columns: string[]
}

export default function Datatable<T extends Record<string, any>>({
  data,
  columns,
}: DatatableProps<T>) {
  if (!data.length) return null

  return (
    <div className="overflow-x-auto mt-4">
      <table className="table-auto w-full text-left border border-gray-600">
        <thead>
          <tr className="bg-gray-800">
            {columns.map((col) => (
              <th key={col} className="px-3 py-2 text-gray-300 border border-gray-600">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className="hover:bg-gray-700 transition">
              {columns.map((col) => (
                <td key={col} className="px-3 py-2 border border-gray-600 text-gray-100 text-sm">
                  {String(row[col])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
