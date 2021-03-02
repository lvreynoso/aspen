import json

from aspen.app.views import api_utils


def test_usergroup_view(session, app, client, user, group):
    with client.session_transaction() as sess:
        sess["profile"] = {"name": "test", "user_id": "test_auth0_id"}
    res = client.get("/api/usergroup")
    expected = {"user": user.to_dict(), "group": group.to_dict()}
    assert expected == json.loads(res.get_data(as_text=True))


def test_samples_view(session, app, client, user, group, sample, sequencing_read):
    with client.session_transaction() as sess:
        sess["profile"] = {"name": "test", "user_id": "test_auth0_id"}
    res = client.get("/api/samples")
    expected = [
        {
            "collection_date": api_utils.format_date(sample.collection_date),
            "collection_location": sample.location,
            "private_identifier": sample.private_identifier,
            "public_identifier": sample.public_identifier,
            "upload_date": api_utils.format_datetime(sequencing_read.upload_date),
            "gisaid": sequencing_read.accessions[0].public_identifier,
        }
    ]
    assert expected == json.loads(res.get_data(as_text=True))


def test_redirect(app, client):
    res = client.get("api/usergroup")
    assert res.status == "302 FOUND"
    redirect_text = b'You should be redirected automatically to target URL: <a href="/login">/login</a>'
    assert redirect_text in res.data