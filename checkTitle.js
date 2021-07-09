var postIndex = undefined;

module.exports.checkTitle =
function (title, posts) {
    title = title.toLowerCase(); //received from URL request
    if (title.includes(' ')) {
        title = title.split(' ').join('-');
    }
    //console.log("in CheckTitle.js: " + title);
    //console.log("in CheckTitle.js: " + posts);
    for (let i = 0; i < posts.length; i++) {
        const post = posts[i];
        const postObjects = Object.values(post);
        let postTitleLowerCase = postObjects[0].toLowerCase();
        if (postTitleLowerCase.includes(' ')) {
            postTitleLowerCase = postTitleLowerCase.split(' ').join('-');
        }
        //console.log(postObjects);
        // const postObjectsLowerCase = [];
        // for (let postObject of postObjects) {
        //     postObject = postObject.toLowerCase();
        //     postObjectsLowerCase.push(postObject);
        // }
        
        if (postTitleLowerCase === title) {
            postIndex = i;
            return [true, i];
        } //else if (title.includes('-')) {
            //title = (title.split('-')).join(' ');
            //if (postTitleLowerCase.includes(title)) {
             //   return [true, i];
           // }
        //}
    }
    return [false, undefined];
  }


module.exports.formatTitle =
function (title) {
    if (title.includes(' ')) {
        title = title.split(' ').join('-');
    }
    return title;
};

module.exports.checkTitleInObject =

function (title, posts) {
    title = title.toLowerCase(); //received from URL request
    if (title.includes(' ')) {
        title = title.split(' ').join('-');
    }
    //console.log("in CheckTitle.js: " + title);
    //console.log("in CheckTitle.js: " + posts);
    for (let i = 0; i < posts.length; i++) {
        const post = posts[i];
        const postObjects = Object.values(post);
        let postTitleLowerCase = postObjects[0].toLowerCase();
        if (postTitleLowerCase.includes(' ')) {
            postTitleLowerCase = postTitleLowerCase.split(' ').join('-');
        }
        //console.log(postObjects);
        // const postObjectsLowerCase = [];
        // for (let postObject of postObjects) {
        //     postObject = postObject.toLowerCase();
        //     postObjectsLowerCase.push(postObject);
        // }
        
        if (postTitleLowerCase === title) {
            postIndex = i;
            return [true, i];
        } //else if (title.includes('-')) {
            //title = (title.split('-')).join(' ');
            //if (postTitleLowerCase.includes(title)) {
             //   return [true, i];
           // }
        //}
    }
    return [false, undefined];
  }