var React = require('react');
var $ = require("jquery");
import List from 'material-ui/lib/lists/list';
import ListItem from 'material-ui/lib/lists/list-item';
import Divider from 'material-ui/lib/divider';
// import Avatar from 'material-ui/lib/avatar';
import Colors from 'material-ui/lib/styles/colors';
import IconButton from 'material-ui/lib/icon-button';
import MoreVertIcon from 'material-ui/lib/svg-icons/navigation/more-vert';
import IconMenu from 'material-ui/lib/menus/icon-menu';
import MenuItem from 'material-ui/lib/menus/menu-item';
import Dialog from 'material-ui/lib/dialog';
import injectTapEventPlugin from 'react-tap-event-plugin';
import FlatButton from 'material-ui/lib/flat-button';
import TextField from 'material-ui/lib/text-field';

var StudentManage = React.createClass({
	getInitialState: function() {
		return {
			currentStudent : null,
			groups : [],
			currentGroup : null
		};
	},
	fetchStudents : function() {
		var url = "/pad/api/user/list/for/course/" + this.props.course.id;
		$.get(url, function(res) {
			this.setState({
				groups : res,
				currentStudent : null,
				currentGroup : null 
			});
		}.bind(this))
	},
	componentDidMount: function() {
	  this.fetchStudents();
	},
	addStudent : function() {
		if(!this.state.currentGroup || !this.state.currentStudent) {
			return;
		}
		var url = "/pad/api/user/add/to/group/" + this.state.currentGroup.id;
		$.post(url, this.state.currentStudent, function(res) {
			if(res != "200") {
				alert(res);
				return;
			}
			this.fetchStudents();
		}.bind(this));
	},
	addButtonHandler : function(group) {
		this.setState({
			currentStudent : {
				name : "",
				username : "",
				studentNumber : ""
			},
			currentGroup : group 
		});
	},
	updateField : function(field) {
		var currentStudent = this.state.currentStudent;
		var ref = this.refs[field + "Input"];
		currentStudent[field] = ref.getValue();
		this.setState({
			currentStudent : currentStudent  
		});
	},
	updateStudent : function() {
		if(!this.state.currentStudent) {
			return;
		}
		var url = "/pad/api/user/" + this.state.currentStudent.authorId + "/update";
		$.post(url, this.state.currentStudent, function(res) {
			if(res != "200") {
				alert(res);
				return;
			}
			this.fetchStudents();
		}.bind(this));
	},
	updateButtonHandler : function(student) {
		this.setState({
			currentStudent : student 
		});
	},
	removeStudent : function(student, group) {
		if(!confirm("确定删除在该组的该学生？")){
			return;
		}
		var url = "/pad/api/user/" + student.authorId + "/remove/from/group/" + group.id;
		$.get(url, function(res) {
			if(res != "200") {
				alert(res);
				return;
			}
			this.fetchStudents();
		}.bind(this));
	},
	cancel : function() {
		this.fetchStudents();
	},
	addGroup : function() {
		$.get("/pad/api/user/add/group/for/course/" + this.props.course.id , function(res) {
			this.fetchStudents();
		}.bind(this));
	},
	render: function() {
		var _this = this;
		var iconButtonElement = (
				  <IconButton
				    touch={true}
				    tooltip="操作"
				    tooltipPosition="bottom-left"
				  >
				    <MoreVertIcon color={Colors.grey400} />
				  </IconButton>
		);
		var groups = this.state.groups.map(function(group, index) {
			var students = group.students.map(function(student) {
				var rightIconMenu = (
				  <IconMenu iconButtonElement={iconButtonElement}>
				    <MenuItem onClick={_this.updateButtonHandler.bind(_this, student)}>编辑</MenuItem>
				    <MenuItem onClick={_this.removeStudent.bind(_this, student, group)}>删除</MenuItem>
				  </IconMenu>
				);
				return (
					<ListItem
				          rightIconButton={rightIconMenu}
				          primaryText={student.name}
				          key={student.authorId}
				          secondaryText={
				            <p>
				              <span style={{color: Colors.darkBlack}}>{student.username}</span><br/>
				              {student.studentNumber}
				            </p>
				          }
				          secondaryTextLines={2}
				    />
				);
			});
			
			var indexToDisplay = index + 1;
			var groupName = "小组" + indexToDisplay;
			return (
				<div key={group.id}>
					<div style={{display : "flex", 
									justifyContent: "space-between", 
									alignItems : "center",
									padding : 15,
									borderBottom : "solid 1px #ccc"
						}}>
							<span style={{fontSize : 18}}>{groupName}</span>
							<span style={{fontSize : 18}} onClick={_this.addButtonHandler.bind(_this, group)}>+</span>							
					</div>
					<List>
						{students}
					</List>
				</div>
			);
		});

		var dialog = "";
		if(this.state.currentStudent) {
			var currentStudent = this.state.currentStudent;
			var dialogTitle = currentStudent.authorId ? "编辑学生":"添加学生";
			var saveHandler = currentStudent.authorId ? this.updateStudent : this.addStudent;
			var actions = [
		      <FlatButton
		        label="取消"
		        secondary={true}
		        onTouchTap={this.cancel}
		      />,
		      <FlatButton
		        label="确定"
		        primary={true}
		        keyboardFocused={true}
		        onTouchTap={saveHandler}
		      />,
		    ];
			dialog = (
				<Dialog
		          title={dialogTitle}
		          actions={actions}
		          modal={false}
		          open={true}
		          onRequestClose={this.cancel}
		        >
		          <TextField floatingLabelText="请输入学生姓名" 
		          			ref="nameInput" 
		          			hintText="" 
		          			onChange={this.updateField.bind(this, "name")} 
		          			value={currentStudent.name} /><br />
		          <TextField floatingLabelText="请输入学生邮箱" 
		          			ref="usernameInput" 
		          			hintText="" 
		          			onChange={this.updateField.bind(this, "username")} 
		          			value={currentStudent.username} /><br />
		          <TextField floatingLabelText="请输入学生学号" 
		          			ref="studentNumberInput" 
		          			hintText="" 
		          			onChange={this.updateField.bind(this, "studentNumber")} 
		          			value={currentStudent.studentNumber} /><br />
		        </Dialog>
			);
		}

		return (
			<div>
				{groups}
				<FlatButton onClick={this.addGroup} label="添加小组" />
				{dialog}
			</div>
		);
	}

});

injectTapEventPlugin();
module.exports = StudentManage;