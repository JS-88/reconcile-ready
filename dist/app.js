'use strict';
const menu = document.querySelector('.menu');
const navigation = document.querySelector('#navigation');
menu?.addEventListener('click', () => {
  const opened = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(opened));
  navigation.classList.toggle('open', opened);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') {
    menu.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('open');
    menu.focus();
  }
});
document.querySelectorAll('[data-view]').forEach(button => {
  button.addEventListener('click', () => {
    const dashboard = button.closest('.dashboard');
    dashboard.querySelectorAll('[data-view]').forEach(tab => tab.setAttribute('aria-pressed', String(tab === button)));
    dashboard.querySelector('#preview-profit').hidden = button.dataset.view !== 'profit';
    dashboard.querySelector('#preview-payout').hidden = button.dataset.view !== 'payout';
  });
});
const money = new Intl.NumberFormat('en-GB', {style:'currency', currency:'GBP'});
const calculator = document.querySelector('.calculator');
if (calculator) {
  const update = () => {
    const price = Number(document.querySelector('#price').value);
    const cost = Number(document.querySelector('#cost').value);
    const ads = Number(document.querySelector('#ads').value);
    const contribution = price - cost - 8 - ads;
    ['price', 'cost', 'ads'].forEach(id => {
      document.querySelector(`#${id}-label`).textContent = `£${document.querySelector(`#${id}`).value}`;
    });
    document.querySelector('#contribution').textContent = money.format(contribution);
    document.querySelector('#margin').textContent = `${(contribution / price * 100).toFixed(1)}% contribution margin`;
    document.querySelector('#calc-equation').textContent = `£${price} − £${cost} − £8 − £${ads} = ${money.format(contribution)}`;
  };
  calculator.querySelectorAll('input').forEach(input => input.addEventListener('input', update));
  update();
}
const form = document.querySelector('#enquiry-form');
let enquiry = '';
form?.addEventListener('submit', event => {
  event.preventDefault();
  const fields = new FormData(form);
  enquiry = `Hello Reconcile Ready,\n\nI'd like to discuss early access.\n\nName: ${fields.get('name')}\nEmail: ${fields.get('email')}\nBusiness: ${fields.get('company') || 'Not provided'}\nInterest: ${fields.get('interest')}\n\n${fields.get('message')}\n\nSent from the Reconcile Ready website enquiry draft.`;
  document.querySelector('#email-ready').hidden = false;
  document.querySelector('#download-enquiry').focus();
});
form?.addEventListener('input', () => {
  document.querySelector('#email-ready').hidden = true;
  enquiry = '';
});
document.querySelector('#download-enquiry')?.addEventListener('click', () => {
  if (!enquiry) return;
  const url = URL.createObjectURL(new Blob([enquiry], {type:'text/plain;charset=utf-8'}));
  const a = document.createElement('a');
  a.href = url; a.download = 'reconcile-ready-enquiry.txt'; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
