var express = require("express");
let userModel = require("../schemas/users");
let bcrypt = require('bcrypt')
module.exports = {
    CreateAnUser: async function (username, password,
        email, role, fullName, avatarUrl, status
    ) {
        let newItem = new userModel({
            username: username,
            password: password,
            email: email,
            role: role,
            fullName: fullName,
            avatarUrl: avatarUrl,
            status: status

        });
        await newItem.save();
        return newItem;
    },
    FindByID: async function (id) {
        return await userModel
            .findOne({
                _id: id,
                isDeleted: false 
            }).populate({
                path:'role', select:'name'
            });
    },
    FindByUsername: async function (username) {
        return await userModel.findOne(
            {
                username: username,
                isDeleted: false
            }
        )
    },
    getAllUser: async function () {
        let users = await userModel
            .find({ isDeleted: false }).
            populate({ path: 'role', select: 'name' })
        return users;
    },
    changePassword: async function (userId, oldPassword, newPassword) {
        let user = await userModel.findOne({ _id: userId, isDeleted: false })
        if (!user) {
            throw new Error('user not found')
        }

        let matched = bcrypt.compareSync(oldPassword, user.password)
        if (!matched) {
            throw new Error('old password is incorrect')
        }

        let genSalt = bcrypt.genSaltSync(10)
        let hashedNewPassword = bcrypt.hashSync(newPassword, genSalt)

        await userModel.findByIdAndUpdate(userId, { password: hashedNewPassword })
        return true
    }
}
