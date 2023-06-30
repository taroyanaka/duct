const validator = require('validator');

const error_check_for_insert_link = (link) => {
    const WHITE_LIST_URL_ARRAY = [
        'https://www.yahoo.co.jp/',
        'https://www.google.co.jp/',
        'https://www.youtube.com/',
    ];    
    const reserved_words = ['SELECT', 'FROM', 'WHERE', 'INSERT', 'DELETE', 'UPDATE', 'DROP', 'ALTER', 'CREATE', 'TABLE', 'INTO', 'VALUES', 'AND', 'OR', 'NOT', 'NULL', 'TRUE', 'FALSE'];
    const is_url = (url) => (/^(https?):\/\/[^\s/$.?#].[^\s]*$/i).test(url);
    const is_include_WHITE_LIST_URL = (target_url_str) => WHITE_LIST_URL_ARRAY.some((WHITE_LIST_URL) => target_url_str.startsWith(WHITE_LIST_URL));
    switch (true) {
        case link === undefined: return 'linkが空です'; break;
        case reserved_words.includes(link): return 'SQLの予約語を含む場合はエラー'; break;
        // URLが2000文字より大きい時はエラー
        case link.length > 2000: return 'URLが長すぎます'; break;
        // リンクが正しいURLの形式でないときに400 Bad Requestを返す。validator.jsを使ってチェックする break;
        // case validator.isURL(link) === false: return 'URLの形式が正しくありません'; break;
        // validator.jsが意図した挙動をしていない可能性があるので、使わないコードにしておく
        case is_url(link) === false: return 'URLの形式が正しくありません'; break;
        case !is_include_WHITE_LIST_URL(link): return '許可されていないURLです'; break;
        default: return 'OK'; break;
    }
};
// console.log(validator);

const any_fn = () => {
    try {
        const any_fn_2 = () => {
        try {
            const wrong_url = 'https::///google.co.jp';
            // validator.isEmail(wrong_url) === false ? 'OK' : (()=>{throw new Error('any_fn_2のエラー1')})();
            const any_error = error_check_for_insert_link(wrong_url);
            // (()=>{throw new Error('適当なエラーを起こす')})();
            console.log(error_check_for_insert_link(wrong_url));
            // console.log('OK');
        } catch (error) {
            // (()=>{throw new Error('any_fn_2のエラー2')})();
            (()=>{throw new Error(error.message)})();
        }
        }

        any_fn_2();
    } catch (error2) {
        // console.log('error2');
        console.log(error2.message);
    }
}
any_fn();