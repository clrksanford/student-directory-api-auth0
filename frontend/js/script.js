var lock = new Auth0Lock('xok7Cc3nkGe9A1gfCTv8AsFX7ivbo0Jz', 'clrksanford.auth0.com', {
    auth: {
      params: {
        scope: 'openid email'
      }
    }
  });

var userProfile;

lock.on('authenticated', function (authResult) {

  console.log(authResult);
  lock.getProfile(authResult.idToken, function (err, profile) {
    if(err) {
      console.log(err);
      return;
    }

    localStorage.setItem('idToken', authResult.idToken);
    localStorage.setItem('name', profile.nickname);
    localStorage.setItem('avatar', profile.picture);
    loadStudents();
    logIn();
  });
});

$(document).ready(function () {
  $('#btn-login').click(function(e) {
    e.preventDefault();
    lock.show();
  });

  $('#btn-logout').click(function (e) {
    e.preventDefault();
    logOut();
  });

  $('form').on('submit', function (e) {
    e.preventDefault();
    newStudent();
  });

  // $(document).on('click', 'li', function (e) {
  //   updateStudent(e);
  // });

  if(isLoggedIn()) {
    logIn();
    showProfile();
    loadStudents();
  }
});

function logIn() {
  $('#btn-login').addClass('hidden');
  $('#btn-logout').removeClass('hidden');
  showProfile();
}

function logOut() {
  $('#btn-login').removeClass('hidden');
  $('#btn-logout').addClass('hidden');

  localStorage.removeItem('idToken');
  localStorage.removeItem('name');
  localStorage.removeItem('avatar');
  userProfile = null;
  window.location.href = "/";
}

function isLoggedIn() {
  if(localStorage.getItem('idToken')) {
    return true;
  } else {
    return false;
  }
}

function showProfile() {
  $('div#welcome').removeClass('hidden');
  $('.nickname').text(localStorage.getItem('name'));
  $('.avatar').attr('src', localStorage.getItem('avatar'));
}

function loadStudents() {
  $.ajax({
    url: 'http://localhost:3000/students',
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('idToken')
    }
  })
    .done(function (result) {
      result.forEach(function (student) {
        var enrolled;

        if(student.currentlyEnrolled) {
          enrolled = 'Enrolled'
        } else {
          enrolled = 'Not enrolled'
        }

        var li = $('<li />');
        var firstName = $('<span />').text(`Name: ${student.firstName} `);
        var lastName = $('<span />').text(`${student.lastName}`);
        var name = $('<p />').append(firstName, lastName).addClass('name');
        var email = $('<p />').text(`Email: ${student.email}`).addClass('email');
        var slack = $('<p />').text(`Slack Handle: ${student.slackHandle}`).addClass('slack');
        var enrollment = $('<p />').text(`Enrollment Status: ${enrolled}`).addClass('enrollment');

        li.append(name, email, slack, enrollment);

        $('ul#studentList').append(li);
      });
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
      console.log(errorThrown);
    });
}

function newStudent() {
  var firstName = $('#firstName').val();
  var lastName = $('#lastName').val();
  var email = $('#email').val();
  var slack = $('#slack').val();
  var enrollment = !!$('#enrolled option:selected').val();

  console.log(firstName, lastName, email, slack, enrollment);

  $.ajax({
    url: 'http://localhost:3000/students',
    method: 'POST',
    data: {
      firstName: firstName,
      lastName: lastName,
      email: email,
      slackHandle: slack,
      currentlyEnrolled: enrollment
    },
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('idToken')
    }
  })
    .done(function (response) {
      console.log('Success!');
      $('ul#studentList').empty();
      loadStudents();
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
      console.log(errorThrown);
    })
}

// function updateStudent(e) {
//   getStudentInfo(e);
//
// }
//
// function getStudentInfo(e) {
//   var student = $(e.currentTarget).html();
//   var firstName = student.split('Name: ')[1].split(' </span>')[0];
//   var lastName = student.split('</span><span>')[1].split('</span></p>')[0];
//   var email = $(e.currentTarget).find('p.email').text().split(': ')[1];
//   var slack = $(e.currentTarget).find('p.slack').text().split(': ')[1];
//   var enrolled = $(e.currentTarget).find('p.enrollment').text().split(': ')[1];
//
//   showUpdateForm(firstName, lastName, email, slack, enrolled);
// }
//
// function showUpdateForm(firstName, lastName, email, slack, enrolled) {
//   $('#firstName').val(firstName);
//   $('#lastName').val(lastName);
//   $('#email').val(email);
//   $('#slack').val(slack);
//
//   if(enrolled === "Enrolled") {
//     $('#enrolled option:selected').val('true');
//   } else {
//     $('#enrolled option:selected').val('false');
//   }
// }
