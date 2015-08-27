var StatusChoices = {
	'DRAFT': 0,
	'PENDING_REVIEW': 1,
	'UNDER_REVIEW': 2,
	'PUBLISHED': 3,
	'UNPUBLISHED': 4,
	'REJECTED': 5,
	'APPROVED': 6
};

function STATUS_CHOICES(choice){
	console.log(choice)
	switch(choice){
		case 0:
			return gettext('APP-DRAFT-TEXT');
			break;

		case 1:
			return gettext('APP-PENDINGREVIEW-TEXT');
			break;

		case 2:
			return gettext('APP-PENDINGREVIEW-TEXT');
			break;

		case 3:
			return gettext('APP-PUBLISHED-TEXT');
			break;

		case 4:
			return gettext('APP-UNPUBLISH-TEXT');
			break;

		case 5:
			return gettext('APP-REJECTED-TEXT');
			break;

		case 6:
			return gettext('APP-APPROVED-TEXT');
			break;

	}
}