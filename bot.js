var TelegramBot = require('node-telegram-bot-api');
var token       = '186219760:AAFT9zfqS4gGtB3K52wRBZ0g-X6qRb3AzWI';
var bot         = new TelegramBot(token, { polling: true });

var request     = require('request');
var fs          = require('fs');

var jobOptions  = {
  url: 'http://rabota.ykt.ru/jobs.json',
  headers: { 
    'Content-Type':'application/json; charset=UTF-8'
  }
};

// var vacancies = require('./vacancies.json');
var vacancies = JSON.parse(fs.readFileSync('./vacancies.json', 'utf8'));
var bookPages = vacancies.length;

var opts = {
  reply_markup: JSON.stringify({
    keyboard: [
      ['Вакансии']
    ],
    'one_time_keyboard': false,
    'resize_keyboard': true
  })
};

bot.on('text', function(msg) {
  var msgChatId = msg.chat.id;
  var msgText = msg.text;
  // vacancies = JSON.parse(fs.readFileSync('./vacancies.json', 'utf8'));
  fs.readFile('./vacancies.json', 'utf8', function (err, data) {
    if (err) throw err;
    vacancies = JSON.parse(data);
  });

  if (msgText === '/start') {
    console.log(msg);
    bot.sendMessage(msgChatId, 'Привет ' + msg.chat.first_name, opts);
  } else if (msgText === 'Вакансии') {
    sendJobs(msgChatId);
  }
});

bot.on('callback_query', function (message) {
  var msg = message.message;
  var editOptions = Object.assign({}, getPagination(parseInt(message.data), bookPages), { chat_id: msg.chat.id, message_id: msg.message_id});
  if (vacancies[message.data - 1].contactPerson.fio === '')
    bot.editMessageText("<a href=\"http://rabota.ykt.ru/jobs/view?id=" + vacancies[message.data - 1].id + "\">" + vacancies[message.data - 1].title + "</a>" + "\n" + "<b>" + vacancies[message.data - 1].salary.text + "</b>" + "\n\n" + vacancies[message.data - 1].brief + "\n\n" + vacancies[message.data - 1].requirements + "\n\n" + vacancies[message.data - 1].contactPerson.email + "\n" + vacancies[message.data - 1].contactPerson.phone, editOptions);
  else
    bot.editMessageText("<a href=\"http://rabota.ykt.ru/jobs/view?id=" + vacancies[message.data - 1].id + "\">" + vacancies[message.data - 1].title + "</a>" + "\n" + "<b>" + vacancies[message.data - 1].salary.text + "</b>" + "\n\n" + vacancies[message.data - 1].brief + "\n\n" + vacancies[message.data - 1].requirements + "\n\n" + vacancies[message.data - 1].contactPerson.fio + "\n" + vacancies[message.data - 1].contactPerson.email + "\n" + vacancies[message.data - 1].contactPerson.phone, editOptions);
});

function getPagination( current, maxpage ) {
  var keys = [];
  if (current>1) keys.push({ text: `« 1`, callback_data: '1' });
  if (current>2) keys.push({ text: `‹ ${current-1}`, callback_data: (current-1).toString() });
  keys.push({ text: `· ${current} ·`, callback_data: current.toString() });
  if (current<maxpage-1) keys.push({ text: `${current+1} ›`, callback_data: (current+1).toString() })
  if (current<maxpage) keys.push({ text: `${maxpage} »`, callback_data: maxpage.toString() });

  return {
    parse_mode: 'html',
    reply_markup: JSON.stringify({
      inline_keyboard: [ keys ]
    })
  };
}

function sendJobs(msgChatId){
  if (vacancies[0].contactPerson.fio === '')
    bot.sendMessage(msgChatId, "<a href=\"http://rabota.ykt.ru/jobs/view?id=" + vacancies[0].id + "\">" + vacancies[0].title + "</a>" + "\n" + "<b>" + vacancies[0].salary.text + "</b>" + "\n\n" + vacancies[0].brief + "\n\n" + vacancies[0].requirements + "\n\n" + vacancies[0].contactPerson.email + "\n" + vacancies[0].contactPerson.phone, getPagination(1,bookPages));
  else
    bot.sendMessage(msgChatId, "<a href=\"http://rabota.ykt.ru/jobs/view?id=" + vacancies[0].id + "\">" + vacancies[0].title + "</a>" + "\n" + "<b>" + vacancies[0].salary.text + "</b>" + "\n\n" + vacancies[0].brief + "\n\n" + vacancies[0].requirements + "\n\n" + vacancies[0].contactPerson.fio + "\n" + vacancies[0].contactPerson.email + "\n" + vacancies[0].contactPerson.phone, getPagination(1,bookPages));
}

setInterval(function() {
  https.get('https://gentle-chamber-61586.herokuapp.com');
  var res_data ='';
  request.get(jobOptions)
    .on('data', function(data) {
      res_data += data;
    })
    .on('end', function() {
      fs.writeFile('./vacancies.json', JSON.stringify(JSON.parse(res_data).jobs), function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("JSON saved");
          
        }
      }); 
    })
    .on('error', function(err) {
      console.log(err)
    })
}, 180000);