export default {
    'en' : {
        'menu' : {
            'test' : `test`
        },
        table: {
            paginationNumbers: (number = undefined, totalSoFar = undefined, total = undefined) => {
                if (!number || number == 0)
                    return '';
                if (totalSoFar && total)
                    return `Show ${number} | ${totalSoFar} of ${total}`
                return `Show ${number} `;
            },
            paginationLastPage: `last`,
            paginationFirstPage: `first`,
            paginationPrevious: `pre`,
            paginationNext: `next`,
        }
    }
}