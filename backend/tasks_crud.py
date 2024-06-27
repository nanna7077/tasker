from flask import Blueprint, request, jsonify

from models import *
from auth import *

tasks_crud = Blueprint("tasks_crud", __name__)

@tasks_crud.route("/create", methods=["POST"]) # Create
@auth.login_required
def create_task():
    try:
        sessionkey = request.headers.get("authentication")
        if not sessionkey:
            return {"error": "Invalid SessionKey"}, 401
        user = getRequestUser(sessionkey)
        if not user:
            return {"error": "Invalid SessionKey"}, 401
        requestData = request.get_json(force=True)

        title = requestData.get("title")
        description = requestData.get("description")
        due_at = requestData.get("due_at")
        try:
            due_at = datetime.datetime.strptime(due_at, "%Y-%m-%d %H:%M")
        except:
            due_at = None
        if not title or not due_at:
            return {"error": "Missing required fields"}, 400
        task = Task(title=title, description=description, created_at=datetime.datetime.utcnow(), due_at=due_at, user_id=user.id)
        db.session.add(task)
        db.session.commit()
        return jsonify({"task": task.to_dict()}), 200

    except Exception as e:
        return {"error": str(e)}

@tasks_crud.route("/update", methods=["POST"]) # Update
@auth.login_required
def update_task():
    try:
        sessionkey = request.headers.get("authentication")
        if not sessionkey:
            return {"error": "Invalid SessionKey"}, 401
        user = getRequestUser(sessionkey)
        if not user:
            return {"error": "Invalid SessionKey"}, 401
        requestData = request.get_json(force=True)

        task = Task.query.filter_by(id=requestData.get("id")).first()
        if not task:
            return {"error": "Task not found"}, 404
        if task.user_id != user.id:
            return {"error": "Unauthorized"}, 401
        if "title" in requestData:
            task.title = requestData.get("title")
        if "description" in requestData:
            task.description = requestData.get("description")
        if "due_at" in requestData:
            try:
                task.due_at = datetime.datetime.strptime(requestData.get("due_at"), "%Y-%m-%d %H:%M")
            except:
                return {"error": "Invalid due_at"}, 400
        if "status" in requestData:
            try:
                task.status = int(requestData.get("status"))
            except:
                return {"error": "Invalid status"}, 400
        db.session.commit()
        return jsonify({"task": task.to_dict()}), 200

    except Exception as e:
        return {"error": str(e)}

@tasks_crud.route("/delete", methods=["DELETE"]) # Delete
@auth.login_required
def delete_task():
    try:
        sessionkey = request.headers.get("authentication")
        if not sessionkey:
            return {"error": "Invalid SessionKey"}, 401
        user = getRequestUser(sessionkey)
        if not user:
            return {"error": "Invalid SessionKey"}, 401
        requestData = request.get_json(force=True)

        task = Task.query.filter_by(id=requestData.get("id")).first()
        if not task:
            return {"error": "Task not found"}, 404
        if task.user_id != user.id:
            return {"error": "Unauthorized"}, 401
        db.session.delete(task)
        db.session.commit()
        return jsonify({"task": task.to_dict()}), 200

    except Exception as e:
        return {"error": str(e)}
    
@tasks_crud.route("/view/<int:task_id>", methods=["POST"]) # View
@auth.login_required
def get_task(task_id):
    try:
        sessionkey = request.headers.get("authentication")
        if not sessionkey:
            return {"error": "Invalid SessionKey"}, 401
        user = getRequestUser(sessionkey)
        if not user:
            return {"error": "Invalid SessionKey"}, 401
        task = Task.query.filter_by(id=task_id, user_id=user.id).first()
        if not task:
            return {"error": "Task not found"}, 404
        return jsonify({"task": task.to_dict()}), 200

    except Exception as e:
        return {"error": str(e)}

@tasks_crud.route("/list") # View
@auth.login_required
def get_tasks():
    try:
        sessionkey = request.headers.get("authentication")
        if not sessionkey:
            return {"error": "Invalid SessionKey"}, 401
        user = getRequestUser(sessionkey)
        if not user:
            return {"error": "Invalid SessionKey"}, 401
        response = {"inprogress": {"pending": [], "overdue": []}, "completed": [], "discarded": [], "notstarted": []}
        for task in Task.query.filter_by(user_id=user.id).all():
            if task.status == 1:
                if task.due_at < datetime.datetime.utcnow():
                    response["inprogress"]["overdue"].append(task.to_mini_dict())
                else:
                    response["inprogress"]["pending"].append(task.to_mini_dict())
            elif task.status == 2:
                response["completed"].append(task.to_mini_dict())
            elif task.status == -1:
                response["discarded"].append(task.to_mini_dict())
            else:
                response["notstarted"].append(task.to_mini_dict())
        return jsonify({"tasks": response}), 200

    except Exception as e:
        return {"error": str(e)}