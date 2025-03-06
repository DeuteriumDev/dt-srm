from time import sleep
from django.core.management.base import BaseCommand
from django.contrib.contenttypes.models import ContentType
from kits.models import Kit, Question, Answer
from documents.models import Folder
from invoices.models import Invoice, LineItem, Item
from accounts.models import CustomGroup, CustomUser, CustomPermissions, Organization


class Command(BaseCommand):
    help = "Seed db with basic user & docs"

    def create_folder(self, folder_name: str, target_group, **kwargs):
        folder = Folder.objects.create(name=folder_name, **kwargs)
        folder.save()
        CustomPermissions.objects.create(
            content_type=ContentType.objects.get_for_model(Folder),
            object_id=folder.id,
            group=target_group,
        ).save()
        return folder

    def handle(self, *args, **kwargs):

        user = CustomUser.objects.create(
            email="pbateman@test.ca",
            first_name="Patrick",
            last_name="Bateman",
        )
        user.set_password("test")
        user.save()

        group = CustomGroup.objects.create(name="test group 1")
        group.members.add(user)
        group.save()

        # sleep such that the "created" ordering is the order of the workflow
        self.create_folder(
            "New Submissions",
            group,
            description="Invoices that have been submitted, but not reviewed, confirmed, or payed",
            favorite=True,
            inherit_permissions=False,
        )
        sleep(0.1)
        self.create_folder(
            "Awaiting confirmation",
            group,
            description="Invoices awaiting payment, or confirmation of payment",
            favorite=True,
            inherit_permissions=False,
        )
        sleep(0.1)
        self.create_folder(
            "Payed",
            group,
            description="Invoices that have been payed",
            favorite=True,
            inherit_permissions=False,
        )
        self.create_folder(
            "Published",
            group,
            description="Kits that are available for quoting",
            inherit_permissions=False,
        )
        folder = self.create_folder(
            "Work in Progress",
            group,
            description="Kits that are still being worked on, and not available for quoting",
            inherit_permissions=False,
        )

        kit = Kit.objects.create(name="test kit 1", parent=folder)
        kit.save()
        question = Question.objects.create(title="question 1", kit=kit)
        question.save()
        Answer.objects.create(title="answer 1", index=0, question=question).save()
        Answer.objects.create(title="answer 2", index=1, question=question).save()
        org = Organization.objects.create(name="test org 1")
        org.root = group
        org.save()

        inv = Invoice.objects.create(name="test invoice", parent=folder)
        inv.save()

        li = LineItem.objects.create(index=0, invoice=inv)
        li.save()

        Item.objects.create(name="value", value=1.22, line_item=li, index=0).save()
        Item.objects.create(name="value2", value=2.22, line_item=li, index=1).save()

        self.stdout.write(self.style.SUCCESS("Successfully seeded db"))
