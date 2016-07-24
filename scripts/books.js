const kinveyAppId='kid_ByNjILlL';
const kinveyAppSecret='13ecc775cf5049aaaab44d29789d1668';
const kinveyServicesBaseUrl='https://baas.kinvey.com/';

function showView(viewId) {
    $("main > section").hide();
    $("#" + viewId).show();
}

function showHideNavigatinLinks() {
    let loggedIn = sessionStorage.authToken !=null;
    if(loggedIn){
        $("#linkLogin").hide();
        $("#linkRegister").hide();
        $("#linkListBooks").show();
        $("#linkCreateBook").show();
        $("#linkLogout").show();
    }else {
        $("#linkLogin").show();
        $("#linkRegister").show();
        $("#linkListBooks").hide();
        $("#linkCreateBook").hide();
        $("#linkLogout").hide();
    }
}

function showHomeView() {
    showView('viewHome');
}

function showLoginView() {
    showView('viewLogin');
}

function login() {
    let authBase64 = btoa(kinveyAppId + ":" + kinveyAppSecret);
    let loginUrl=kinveyServicesBaseUrl+"user/"+ kinveyAppId + "/login";
    let loginData={
        username: $("#loginUser").val(),
        password: $("#loginPass").val()
    };
    $.ajax({
        method: "POST",
        url: loginUrl,
        data: loginData,
        headers: {"Authorization": "Basic " + authBase64},
        success: loginSuccess,
        error: showAjaxError
    });
    
    function loginSuccess(data,status) {
        sessionStorage.authToken = data._kmd.authtoken;
        showListBooksView();
        showHideNavigatinLinks();
        showInfo("Login successful");
    }
}
function showInfo(messageText) {
    $("#infoBox").text(messageText).show().delay(3000).fadeOut();
}

function showAjaxError(data, status) {
    let errorMsg = "Error: " + JSON.stringify(data);
    $('#errorBox').text(errorMsg).show();
}

function showRegisterView() {
    showView('viewRegister');
}

function register() {
    let authBase64 = btoa(kinveyAppId + ":" + kinveyAppSecret);
    let loginUrl=kinveyServicesBaseUrl+"user/"+ kinveyAppId + "/";
    let registerData={
        username: $("#registerUser").val(),
        password: $("#registerPass").val()
    };
    $.ajax({
        method: "POST",
        url: loginUrl,
        data: registerData,
        headers: {"Authorization": "Basic " + authBase64},
        success: registerSuccess,
        error: showAjaxError
    });

    function registerSuccess(data,status) {
        sessionStorage.authToken = data._kmd.authtoken;
        showListBooksView();
        showHideNavigatinLinks();
        showInfo("User registered successfully.");
    }
}

function showListBooksView() {
    showView('viewListBooks');
    $("#books").text('Loading...');

    let authBase64 = btoa(kinveyAppId + ":" + kinveyAppSecret);
    let booksUrl=kinveyServicesBaseUrl+"appdata/"+ kinveyAppId + "/books";
    let authHeaders= {
        "Authorization": "Kinvey " + sessionStorage.authToken
    };
    $.ajax({
        method: "GET",
        url: booksUrl,
        headers: authHeaders,
        success: booksLoaded,
        error: showAjaxError
    });

    function booksLoaded(books,status) {
        showInfo("Books loaded");
        $("#books").text('');
        let booksTable = $("<table>")
            .append($("<tr>")
                .append($('<th>Title</th>'))
                .append($('<th>Author</th>'))
                .append($('<th>Description</th>'))
            );
        for (let book of books){
            booksTable.append($("<tr>")
                    .append($('<td></td>').text(book.title))
                    .append($('<td></td>').text(book.author))
                    .append($('<td></td>').text(book.description))				
					
            );
            for (let book of books){
                let bookData = {
                    
                }
            }
        }
        $("#books").append(booksTable);
    }
}

function showCreateBookView() {
    showView('viewCreateBook');
}

function createBook() {
    let authBase64 = btoa(kinveyAppId + ":" + kinveyAppSecret);
    let booksUrl=kinveyServicesBaseUrl+"appdata/"+ kinveyAppId + "/books";
    let authHeaders= {
        "Authorization": "Kinvey " + sessionStorage.authToken
    };
    let newBookData= {
        title: $("#bookTitle").val(),
        author: $("#bookAuthor").val(),
        description: $("#bookDescription").val()

    };
    $.ajax({
        method: "POST",
        url: booksUrl,
        data: newBookData,
        headers: authHeaders,
        success: bookCreated,
        error: showAjaxError
    });

    function bookCreated(data) {
        showListBooksView();
        showInfo("Book created.");
    }
}

function showFormAddComment() {
    $("#formAddComment").show();
    $("#linkAddComment").hide();
}

function addBookComment(bookData, commentText, commentAuthor) {
    let kinveyBooksUrl = kinveyServicesBaseUrl+"appdata/"+ kinveyAppId + "/books";
    let kinveyHeaders= {
        "Authorization": "Kinvey " + sessionStorage.authToken,
        'Content-type': 'application/json'
    };

    if(!bookData.comments){
        //No comments still exist -> create and empty array
        bookData.comments =[];
    }
    bookData.comments.push({text: commentText, author: commentAuthor});
    $.ajax({
        method: "PUT",
        url: kinveyBooksUrl+'/'+ bookData._id,
        headers: kinveyHeaders,
        data: JSON.stringify(bookData),
        success: addBookCommentSuccess(),
        error: showAjaxError
    });
    function addBookCommentSuccess(response){
        showListBooksView();
        showInfo('Book comment added.');
    }
}

function logout() {
    sessionStorage.clear();
    showHomeView();
    showHideNavigatinLinks();
}

$(function () {
    $("#linkHome").click(showHomeView);
    $("#linkLogin").click(showLoginView);
    $("#linkRegister").click(showRegisterView);
    $("#linkListBooks").click(showListBooksView);
    $("#linkCreateBook").click(showCreateBookView);
    $("#linkAddComment").click(showFormAddComment);
    $("#linkLogout").click(logout);

    $("#formLogin").submit(function(e){e.preventDefault();login()});
    $("#formRegister").submit(function(e){e.preventDefault();register()});
    $("#formCrateBook").submit(function(e){e.preventDefault();createBook()});
    $("#formAddComment").submit(function(e){e.preventDefault();addBookComment()});

    showHomeView();
    showHideNavigatinLinks();

    $(document)
        .ajaxStart(function () {
            $("#loadingBox").show();
        })
    .ajaxStop(function () {
        $("#loadingBox").hide();
    });
});