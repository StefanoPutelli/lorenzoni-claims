import { executeQuery } from './db';

//SELECT * FROM Edbo.webb_claims;

export async function GET(request: Request) {

    const url = new URL(request.url);
    const columnOrder = url.searchParams.get('column') || 'status';
    const direction = url.searchParams.get('direction') || 'DESC';

    const columnSearch = url.searchParams.get('columnsearch');
    const valueSearch = url.searchParams.get('valuesearch');

    const limit = url.searchParams.get('limit') || '10';
    const offset = url.searchParams.get('offset') || '0';

    let query = 'SELECT * FROM dbo.webb_claims ';
    let countQuery = 'SELECT COUNT(*) as total FROM dbo.webb_claims ';
    const params: string[] = [];

    if (columnSearch && valueSearch) {
        params.push(`WHERE ${columnSearch} LIKE '%${valueSearch}%'`);
    }

    if (params.length) {
        query += params.join(' AND ');
        countQuery += params.join(' AND ');
    }

    query += `ORDER BY ${columnOrder} ${direction}, date DESC, id DESC OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;

    const rows = await executeQuery(query);
    const totalResult = await executeQuery(countQuery) as any; 

    return new Response(JSON.stringify({ rows, total : totalResult[0].total }), {
        headers: { 'content-type': 'application/json' },
    });
}

export async function POST(request: Request) {
    const { id } = await request.json();
    const query = `UPDATE dbo.webb_claims SET status = 'done' WHERE id = ${id}`;
    await executeQuery(query);
    return new Response(null, { status: 204 });
}