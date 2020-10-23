const ascii_to_hexa = (str) => {
    var arr1 = [];
    for (var n = 0, l = str.length; n < l; n ++) 
    {
        var hex = Number(str.charCodeAt(n)).toString(16);
        arr1.push(hex);
    }
    return arr1.join('');
}
const arrToScript = (arr) => {
    let script = '0 OP_RETURN';
    for (let i=0; i<arr.length; i++) {
        script += ' ' + ascii_to_hexa(arr[i]);
    }
    return script;
}
const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
const timeago = (ms) => {
    ms = Date.now() - ms;
    let ago = Math.floor(ms / 1000);
    let part = 0;
    if (ago < 15) { return "just now"; }
    if (ago < 60) { return ago + " sec"; }
    if (ago < 120) { return "1 min"; }
    if (ago < 3600) {
        while (ago >= 60) { ago -= 60; part += 1; }
        return part + " min.";
    }
    if (ago < 7200) { return "1 hr"; }
    if (ago < 86400) {
        while (ago >= 3600) { ago -= 3600; part += 1; }
        return part + " hrs";
    }
    if (ago < 172800) { return "1 day"; }
    if (ago < 604800) {
        part = parseInt(ago / 86400);
        return part + " day(s)";
    }
    if (ago < 1209600) { return "1 wk"; }
    if (ago < 2592000) {
        while (ago >= 604800) { ago -= 604800; part += 1; }
        return part + " wks";
    }
    if (ago < 5184000) { return "1 mth"; }
    if (ago < 31536000) {
        while (ago >= 2592000) { ago -= 2592000; part += 1; }
        return part + " mths";
    }
    if (ago < 1419120000) {
        return ">1 yr";
    }
    return "Not yet";
}
const populateHTML = (count) => {
    for (let i = 0; i < count; i++){
        document.getElementById('message-container').innerHTML +=
        `<div class="nes-container is-rounded with-title is-dark twetch">
        <p class="profile"><img class="nes-avatar is-rounded is-medium"></p>
        <p><a class="userLink" href="" target="_blank"></a></p>
        <span class="timeago"></span>
        <i class="nes-icon coin is-medium nes-pointer"></i>
        <p class="postContent urlFormat"></p>
            <div class="item">
                <i class="nes-icon heart is-medium is-empty"></i><var class="numLikes"></var>
                <!--<button type="button" class="nes-btn share">Share</button>-->
                <a target="_blank" class="txid">#tx</a>
                <!--<i class="nes-icon star is-medium is-empty nes-pointer"></i>-->
                <!--<var class="boostValue"></var>-->
            </div>
        </div>`
    }
}
const compare = (a,b) => {
    let aBoost = a.boostValue, bBoost = b.boostValue, comp = 0;
    if (aBoost < bBoost) {comp = 1} 
    else if (aBoost > bBoost) {comp = -1} 
    return comp;
}
const fetchTwetches = async(sdk, selOrder, rootTx) => {
    // Make sure #message-container exists
    let $container = document.getElementById("message-container");
    if ($container != null) {
        $container.remove();
    }
    $container = document.createElement("div");
    $container.setAttribute("id", "message-container");
    document.body.appendChild($container);

    let orderBy = 'orderBy: CREATED_AT_DESC', response = '', posts = '';
    if (selOrder === '1') {
        orderBy = 'orderBy: LIKES_BY_POST_ID__COUNT_DESC';
    };
        
    response = await sdk.query(`{
  allPosts(filter: {bContent: {endsWith: "$gbc"}, mediaByMediaIdExists: true}, ${orderBy}) {
    nodes {
      bContent
      files
      mediaId
      id
      createdAt
      numLikes
      replyCount
      transaction
      userId
      userByUserId {
        icon
        name
      }
      youLiked
    }
  }
}`);

    posts = response.allPosts.nodes;
    let profiles = document.getElementsByClassName("nes-avatar")
    let userLinks = document.getElementsByClassName("userLink");
    let contents = document.getElementsByClassName("postContent")
    let hearts = document.getElementsByClassName("heart")
    let likes = document.getElementsByClassName("numLikes");
    //let shares = document.getElementsByClassName("share")
    let txids = document.getElementsByClassName("txid");
    let coins = document.getElementsByClassName("coin");
    //let stars = document.getElementsByClassName("nes-icon star is-medium");
    //let boostValues = document.getElementsByClassName("boostValue");
    let times = document.getElementsByClassName("timeago");
    let twetches = document.getElementsByClassName("twetch");
    populateHTML(posts.length);
    const addTwetch = (post, i) => {
        let content = post.bContent.replace('$zeroschool', '');
        //let boostData = data.find(tx => tx.txid === post.transaction);
        //boostValue = boostData !== undefined ? boostData.boosts : 0;
        /*if (profiles[i] !== undefined) {
            fetch('/user', {
                method: 'post',
                body: JSON.stringify({ userId: post.userId }),
                headers: { 'Content-type': 'application/json' }
            })
            .then(res => res.json())
            .then(data => {
                if (data[0].avatar !== '') {
                    profiles[i].src = data[0].avatar;
                }
                else {
                    profiles[i].src = post.userByUserId.icon;
                }
            })
        }*/
        profiles[i].src = post.userByUserId.icon;
        userLinks[i].innerHTML = ` ${post.userByUserId.name} u/${post.userId}`;
        userLinks[i].href = `https://twetch.app/u/${post.userId}`;
        contents[i].innerHTML = applyURLs(content);
        likes[i].innerHTML = post.numLikes;
        likes[i].id = `${post.transaction}_count`;
        twetches[i].id = post.transaction;
        //shares[i].name = post.transaction;
        hearts[i].id = post.transaction;
        if (post.youLiked === "1") {
            hearts[i].className = 'nes-icon heart is-medium';
        }
        else {
            hearts[i].className += ' nes-pointer';
            hearts[i].addEventListener('click', like);
        }
        txids[i].href = `https://search.matterpool.io/tx/${post.transaction}`;
        coins[i].setAttribute("name", post.userId);
        //stars[i].setAttribute("name", post.transaction)
        /*if (boostValue > 0) {
            stars[i].className = 'nes-icon star is-medium'
        };*/
        //boostValues[i].innerHTML = parseInt(boostValue);
        coins[i].addEventListener('click', askTip);
        //stars[i].addEventListener('click', boost);
        //shares[i].addEventListener('click', shareTwetch);
        //twetches[i].addEventListener('click', goToTwetch);
        let d = new Date(post.createdAt);
        times[i].innerHTML = timeago(d);
    }
        for (let i = 0; i < posts.length; i++) {
            addTwetch(posts[i], i);
        }
};

function goToTwetch() {
        window.open("https://twetch.app/t/" + this.id);
}

function youtube(content) {
    let youRegex = /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/;
    return content.replace(youRegex, function(url) {let id = url.slice(-11)
    return `<div class="video-container" align="center"><iframe title="YouTube video player" src="https://youtube.com/embed/${id}" frameborder="0" allowfullscreen></iframe></div>`})
}
function streamanity(content){
    let strmRegex = /http(s)?:\/\/(.*\.)?streamanity\.com\/video\/([A-z0-9_/?=-]+)/;
    return content.replace(strmRegex, function(url) {let id = url.slice(30);
    return `<div class="video-container" align="center"><iframe title="Streamanity" src="https://streamanity.com/embed/${id}?ref=d14f133c-ae7b-4a87-a277-90fe5bfa32e2" frameborder="0" allowfullscreen></iframe></div>`})
}
function bitcoinfilesEx(content, bfRegex){
    return content.replace(bfRegex, function(url){let txid = url.substr(url.length - 64);
        return `<div><a href="https://media.bitcoinfiles.org/${txid}"><img src="https://media.bitcoinfiles.org/${txid}" class="bitcoinfiles"></a></div>`;
    })
}
function exBFiles(content, show) {
    if (content.indexOf("https://www.bitcoinfiles.org/t") >= 0) {return content.match(/http(s)?:\/\/(.*\.)?bitcoinfiles\.org\/t\/([A-z0-9_\/?=]+)/)[3]}
    else if (content.indexOf("https://media.bitcoinfiles.org/") >= 0){return content.match(/http(s)?:\/\/(.*\.)?media\.bitcoinfiles\.org\/([A-z0-9]+)/)[3]}
    else {if(show){showPopup('No BitcoinFile found.', 'OK');}return ''}
}
function applyURLs(content) {
    if (content.indexOf("https://www.bitcoinfiles.org/t") >= 0) {return bitcoinfilesEx(content, /http(s)?:\/\/(.*\.)?bitcoinfiles\.org\/t\/([A-z0-9_\/?=]+)/)}
    else if (content.indexOf("https://media.bitcoinfiles.org/") >= 0){return bitcoinfilesEx(content, /http(s)?:\/\/(.*\.)?media\.bitcoinfiles\.org\/([A-z0-9]+)/)}
    else if (content.indexOf("youtu") >= 0){return youtube(content)}
    else if (content.indexOf("streamanity.com") >= 0){return streamanity(content)}
    else {var urlRegex = /(https?:\/\/[^\s]+)/g;return content.replace(urlRegex, function(url) {return '<a href="' + url + '"target="_blank">' + url + '</a>'})}
}
