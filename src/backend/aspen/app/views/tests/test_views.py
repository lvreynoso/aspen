import json

from aspen.test_infra.models.usergroup import group_factory, user_factory


def test_usergroup_view(session, app, client):
    group = group_factory()
    user = user_factory(group)
    session.add(group)
    session.commit()
    with client.session_transaction() as sess:
        sess["profile"] = {"name": user.name, "user_id": user.auth0_user_id}
    res = client.get("/api/usergroup")
    expected = {"user": user.to_dict(), "group": group.to_dict()}
    assert expected == json.loads(res.get_data(as_text=True))


def test_redirect(app, client):
    res = client.get("api/usergroup")
    assert res.status == "302 FOUND"
    redirect_text = b'You should be redirected automatically to target URL: <a href="/login">/login</a>'
    assert redirect_text in res.data