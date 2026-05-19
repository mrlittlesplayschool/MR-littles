import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],   // RouterLink removed — all nav is scroll-based
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class HomeComponent {

  /* ── Smooth scroll helper (used by buttons inside this page) ── */
  scrollToSection(sectionId: string): void {
    const el = document.getElementById(sectionId);
    if (!el) return;
    const navHeight = parseInt(
      getComputedStyle(document.documentElement)
        .getPropertyValue('--nav-h') || '76'
    );
    const top = el.getBoundingClientRect().top + window.scrollY - navHeight - 20;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  /* ── Enquiry form model ── */
  enquiry = {
    parentName: '',
    phone: '',
    childName: '',
    age: '',
    program: '',
    message: ''
  };

  /* ── Marquee items ── */
  marqueeItems = [
    'Playgroup', 'Nursery', 'Junior KG', 'Senior KG',
    'Art & Craft', 'Music & Dance', 'Outdoor Play',
    'Admissions Open 2026–27', 'Story Time'
  ];

  /* ── About features ── */
  features = [
    {
      icon: '🧠',
      bg: 'rgba(255,179,71,.14)',
      title: 'Play-Based Curriculum',
      desc: 'Learning through joy, curiosity and hands-on exploration every single day.'
    },
    {
      icon: '🏠',
      bg: 'rgba(94,196,255,.14)',
      title: 'Purpose-Built Space',
      desc: 'Bright, safe, childproofed classrooms designed for little learners from day one.'
    },
    {
      icon: '📱',
      bg: 'rgba(93,220,140,.14)',
      title: 'Real-Time Parent Updates',
      desc: 'Daily photos, attendance, and activity summaries delivered straight to you.'
    }
  ];

  /* ── Programs ── */
  programs = [
    {
      icon: '🌱',
      name: 'Playgroup',
      age: '1.5 – 2.5 yrs',
      iconBg: 'rgba(255,179,71,.14)',
      iconBorder: 'rgba(255,179,71,.24)',
      ageBg: 'rgba(255,179,71,.1)',
      ageBorder: 'rgba(255,179,71,.2)',
      ageColor: 'var(--sun)',
      desc: 'A warm, gentle introduction to school life. Focused on sensory play, social bonding, and building comfort in a new environment.',
      tags: ['Sensory Play', 'Rhymes', 'Motor Skills', 'Social Play']
    },
    {
      icon: '🦋',
      name: 'Nursery',
      age: '2.5 – 3.5 yrs',
      iconBg: 'rgba(255,126,179,.14)',
      iconBorder: 'rgba(255,126,179,.24)',
      ageBg: 'rgba(255,126,179,.1)',
      ageBorder: 'rgba(255,126,179,.2)',
      ageColor: 'var(--rose)',
      desc: 'Confidence through language, creative arts, and imaginative play. Building the foundations of communication and expression.',
      tags: ['Language', 'Art & Craft', 'Numbers', 'Outdoor Time']
    },
    {
      icon: '🚀',
      name: 'Junior KG',
      age: '3.5 – 4.5 yrs',
      iconBg: 'rgba(94,196,255,.14)',
      iconBorder: 'rgba(94,196,255,.24)',
      ageBg: 'rgba(94,196,255,.1)',
      ageBorder: 'rgba(94,196,255,.2)',
      ageColor: 'var(--sky)',
      desc: 'School readiness through phonics, early numeracy, and life skills. Expert teachers guide every child at their own pace.',
      tags: ['Phonics', 'Math Play', 'Science', 'Show & Tell']
    },
    {
      icon: '⭐',
      name: 'Senior KG',
      age: '4.5 – 6 yrs',
      iconBg: 'rgba(93,220,140,.14)',
      iconBorder: 'rgba(93,220,140,.24)',
      ageBg: 'rgba(93,220,140,.1)',
      ageBorder: 'rgba(93,220,140,.2)',
      ageColor: 'var(--leaf)',
      desc: 'Comprehensive kindergarten prep with advanced literacy, critical thinking, and leadership skills for a confident school start.',
      tags: ['Literacy', 'Critical Thinking', 'Leadership', 'Projects']
    }
  ];

  /* ── Why Us ── */
  whyCards = [
    { num: '01', icon: '👩‍🏫', color: 'var(--sun)',  title: 'Trained Educators',  desc: 'Every teacher is certified in early childhood education and chosen for their genuine passion for little ones.' },
    { num: '02', icon: '🏠',   color: 'var(--sky)',  title: 'Safe & Modern',      desc: 'Fully CCTV-monitored, childproofed premises with vibrant, spacious classrooms designed for discovery.' },
    { num: '03', icon: '📱',   color: 'var(--rose)', title: 'Parent Connected',   desc: 'Real-time daily updates, activity photos and attendance summaries keep you close to your child\'s journey.' },
    { num: '04', icon: '🍎',   color: 'var(--leaf)', title: 'Nutrition First',    desc: 'Fresh, home-style wholesome snacks prepared daily with individual dietary preferences respected.' },
    { num: '05', icon: '🎯',   color: 'var(--sun)',  title: 'Small Batches',      desc: 'Deliberately small class sizes ensure every single child receives individual attention and care.' },
    { num: '06', icon: '🌍',   color: 'var(--sky)',  title: 'Holistic Approach',  desc: 'Our curriculum blends Montessori principles, play-based learning and structured academics in perfect balance.' }
  ];

  /* ── Testimonials ── */
  testimonials = [
    {
      initials: 'PS',
      text: 'The moment we stepped in, we knew this was different. So fresh, so intentional. Our daughter asks to go to school every single morning now!',
      name: 'Priya Sharma',
      role: 'Parent of Aanya, 3 yrs · Founding Family'
    },
    {
      initials: 'RM',
      text: 'A new school that actually feels premium — the space, the teachers, the communication. Thrilled to be part of the founding batch!',
      name: 'Rahul Mehta',
      role: 'Parent of Aarav, 2.5 yrs · Founding Family'
    },
    {
      initials: 'DN',
      text: 'My son — who was terrified of new places — settled in within a week. The teachers genuinely love what they do. Mr. Littles is something special.',
      name: 'Deepa Nair',
      role: 'Parent of Rohan, 4 yrs · Founding Family'
    }
  ];

  /* ── Contact info ── */
  contactInfo = [
    { icon: '📞', bg: 'rgba(255,179,71,.12)',  label: 'Call Us',      value: '+91 98765 43210' },
    { icon: '✉️', bg: 'rgba(94,196,255,.12)',  label: 'Email Us',     value: 'hello@mrlittles.in' },
    { icon: '📍', bg: 'rgba(93,220,140,.12)',  label: 'Visit Us',     value: '123 Little Stars Lane, Anna Nagar, Chennai' },
    { icon: '🕐', bg: 'rgba(255,126,179,.12)', label: 'School Hours', value: 'Mon–Sat · 8:00 AM – 6:00 PM' }
  ];

  /* ── Hero activity grid ── */
  activities = [
    { icon: '🎨', label: 'Art' },
    { icon: '📚', label: 'Read' },
    { icon: '🎵', label: 'Music' },
    { icon: '🌱', label: 'Nature' },
    { icon: '🏃', label: 'Play' },
    { icon: '🎭', label: 'Drama' }
  ];

  submitEnquiry(): void {
    if (!this.enquiry.parentName || !this.enquiry.phone) return;
    // TODO: Wire to EnquiryService
    alert(`Thank you, ${this.enquiry.parentName}! We'll contact you within 24 hours.`);
    this.enquiry = { parentName: '', phone: '', childName: '', age: '', program: '', message: '' };
  }
}