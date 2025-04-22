from time import sleep
from django.core.management.base import BaseCommand
from django.contrib.contenttypes.models import ContentType
from kits.models import Kit, Question, Answer
from documents.models import Folder
from invoices.models import Invoice, LineItem, Item
from accounts.models import CustomGroup, CustomUser, CustomPermissions, Organization
from django.db import transaction


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

    def create_user(self, email, first_name, last_name, admin_group):
        user = CustomUser.objects.create(
            email=email,
            first_name=first_name,
            last_name=last_name,
        )
        user.set_password("test")
        user.save()

        users_group = CustomGroup.objects.create(name=f"{email}'s workgroup")
        CustomPermissions.objects.create(
            content_type=ContentType.objects.get_for_model(CustomGroup),
            object_id=users_group.id,
            group=users_group,
            can_create=False,
            can_read=True,
            can_update=False,
            can_delete=False,
        )

        CustomPermissions.objects.create(
            content_type=ContentType.objects.get_for_model(CustomGroup),
            object_id=users_group.id,
            group=admin_group,
            can_create=False,
            can_read=True,
            can_update=True,
            can_delete=False,
        )

        users_group.members.add(user)

        return user

    def seed_org_test(self):
        org_root = CustomGroup.objects.create(
            name="test-org root group",
            hidden=True,
        )
        CustomPermissions.objects.create(
            content_type=ContentType.objects.get_for_model(CustomGroup),
            object_id=org_root.id,
            group=org_root,
            can_create=False,
            can_read=True,
            can_update=False,
            can_delete=False,
        ).save()

        org_admins = CustomGroup.objects.create(
            name="test-org admins",
            parent=org_root,
        )
        CustomPermissions.objects.create(
            content_type=ContentType.objects.get_for_model(CustomGroup),
            object_id=org_admins.id,
            group=org_admins,
            can_create=True,
            can_read=True,
            can_update=True,
            can_delete=False,
        ).save()

        CustomPermissions.objects.create(
            content_type=ContentType.objects.get_for_model(CustomGroup),
            object_id=org_root.id,
            group=org_admins,
        ).save()

        pb_user = self.create_user(
            "pbateman@test.ca",
            "Patrick",
            "Bateman",
            org_admins,
        )

        qs_user = self.create_user(
            "qcateman@test.ca",
            "Qatrick",
            "Cateman",
            org_admins,
        )

        org_admins.members.add(pb_user)

        org_root.members.add(pb_user)
        org_root.members.add(qs_user)

        org_root.save()

        # sleep such that the "created" ordering is the order of the workflow
        self.create_folder(
            "New Submissions",
            org_root,
            description="Invoices that have been submitted, but not reviewed, confirmed, or payed",
            favorite=True,
            inherit_permissions=False,
        )
        sleep(0.1)
        self.create_folder(
            "Awaiting confirmation",
            org_root,
            description="Invoices awaiting payment, or confirmation of payment",
            favorite=True,
            inherit_permissions=False,
        )
        sleep(0.1)
        self.create_folder(
            "Payed",
            org_root,
            description="Invoices that have been payed",
            favorite=True,
            inherit_permissions=False,
        )
        self.create_folder(
            "Published",
            org_root,
            description="Kits that are available for quoting",
            inherit_permissions=False,
        )
        folder = self.create_folder(
            "Work in Progress",
            org_root,
            description="Kits that are still being worked on, and not available for quoting",
            inherit_permissions=False,
        )

        kit = Kit.objects.create(name="test kit 1", parent=folder)
        kit.save()
        question = Question.objects.create(title="question 1", kit=kit)
        question.save()
        Answer.objects.create(title="answer 1", index=0, question=question).save()
        Answer.objects.create(title="answer 2", index=1, question=question).save()
        org = Organization.objects.create(name="test-org")
        org.root = org_root
        org.save()

        inv = Invoice.objects.create(name="test invoice", parent=folder)
        inv.save()

        li = LineItem.objects.create(index=0, invoice=inv)
        li.save()

        Item.objects.create(name="value", value=1.22, line_item=li, index=0).save()
        Item.objects.create(name="value2", value=2.22, line_item=li, index=1).save()

    def seed_org_other(self):
        org_root = CustomGroup.objects.create(
            name="other-org root group",
            hidden=True,
        )
        CustomPermissions.objects.create(
            content_type=ContentType.objects.get_for_model(CustomGroup),
            object_id=org_root.id,
            group=org_root,
            can_create=False,
            can_read=True,
            can_update=False,
            can_delete=False,
        ).save()

        org_admins = CustomGroup.objects.create(
            name="other-org admins",
            parent=org_root,
        )
        CustomPermissions.objects.create(
            content_type=ContentType.objects.get_for_model(CustomGroup),
            object_id=org_admins.id,
            group=org_admins,
            can_create=True,
            can_read=True,
            can_update=True,
            can_delete=False,
        ).save()

        CustomPermissions.objects.create(
            content_type=ContentType.objects.get_for_model(CustomGroup),
            object_id=org_root.id,
            group=org_admins,
        ).save()

        pb_user = self.create_user(
            "rdateman@other.ca",
            "Ratrick",
            "Dateman",
            org_admins,
        )
        org_admins.members.add(pb_user)

        qs_user = self.create_user(
            "seateman@other.ca",
            "Satrick",
            "Eateman",
            org_admins,
        )

        org_root.members.add(pb_user)
        org_root.members.add(qs_user)

        org_root.save()

        # sleep such that the "created" ordering is the order of the workflow
        self.create_folder(
            "New Submissions",
            org_root,
            description="Invoices that have been submitted, but not reviewed, confirmed, or payed",
            favorite=True,
            inherit_permissions=False,
        )
        sleep(0.1)
        self.create_folder(
            "Awaiting confirmation",
            org_root,
            description="Invoices awaiting payment, or confirmation of payment",
            favorite=True,
            inherit_permissions=False,
        )
        sleep(0.1)
        self.create_folder(
            "Payed",
            org_root,
            description="Invoices that have been payed",
            favorite=True,
            inherit_permissions=False,
        )
        self.create_folder(
            "Published",
            org_root,
            description="Kits that are available for quoting",
            inherit_permissions=False,
        )
        folder = self.create_folder(
            "Work in Progress",
            org_root,
            description="Kits that are still being worked on, and not available for quoting",
            inherit_permissions=False,
        )

        kit = Kit.objects.create(name="other kit 1", parent=folder)
        kit.save()
        question = Question.objects.create(title="question 1", kit=kit)
        question.save()
        Answer.objects.create(title="answer 1", index=0, question=question).save()
        Answer.objects.create(title="answer 2", index=1, question=question).save()
        org = Organization.objects.create(name="other-org")
        org.root = org_root
        org.save()

        inv = Invoice.objects.create(name="other invoice", parent=folder)
        inv.save()

        li = LineItem.objects.create(index=0, invoice=inv)
        li.save()

        Item.objects.create(name="value", value=1.22, line_item=li, index=0).save()
        Item.objects.create(name="value2", value=2.22, line_item=li, index=1).save()

    @transaction.atomic()
    def handle(self, *args, **kwargs):
        self.seed_org_test()
        self.seed_org_other()

        self.stdout.write(self.style.SUCCESS("Successfully seeded db"))
