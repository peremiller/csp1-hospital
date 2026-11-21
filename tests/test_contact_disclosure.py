"""Read-only regression checks for the static hospital contact experience."""
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]


class ContactDisclosureTests(unittest.TestCase):
    def test_form_kept_but_is_not_claimed_as_delivery(self):
        text = (ROOT / "contact.html").read_text(encoding="utf-8")
        self.assertIn('id="contact-form"', text)
        self.assertIn('name="message"', text)
        self.assertIn("This static site cannot send messages.", text)
        self.assertIn("This information page cannot send inquiries or book appointments.", text)
        self.assertNotIn("our team will get back to you", text)
        self.assertNotIn("Use the form and we'll respond", text)

    def test_contact_navigation_is_not_described_as_booking(self):
        for name in ("home.html", "contact.html"):
            with self.subTest(name=name):
                text = (ROOT / name).read_text(encoding="utf-8")
                self.assertNotIn("Book a Visit", text)
                self.assertIn('href="contact.html"', text)
                self.assertIn("Contact options", text)

    def test_about_and_gallery_do_not_promise_booking_or_message_delivery(self):
        for name in ("about.html", "gallery.html"):
            with self.subTest(name=name):
                text = (ROOT / name).read_text(encoding="utf-8")
                self.assertIn('href="contact.html"', text)
                self.assertIn("Contact options", text)
                self.assertNotIn("Book a Visit", text)
                self.assertNotIn("Send us a message", text)
        about = (ROOT / "about.html").read_text(encoding="utf-8")
        self.assertNotIn("reach out and our team will be glad to help", about)

    def test_every_page_footer_links_to_truthful_contact_options(self):
        for name in ("home.html", "about.html", "gallery.html", "contact.html"):
            with self.subTest(page=name):
                text = (ROOT / name).read_text(encoding="utf-8")
                self.assertIn('href="contact.html">Contact options →</a>', text)
                self.assertNotIn("Send us a message →", text)

    def test_no_submission_or_storage_feature_was_removed(self):
        text = (ROOT / "contact.html").read_text(encoding="utf-8")
        for field in ("name", "email", "phone", "message"):
            self.assertIn(f'name="{field}"', text)
        self.assertIn('role="status"', text)


if __name__ == "__main__":
    unittest.main()
